
#include <errno.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <libubox/blobmsg_json.h>
#include <libubox/avl-cmp.h>
#include <libubus.h>
#include <uci.h>
#include <shadow.h>

#include <rpcd/plugin.h>

static const struct rpc_daemon_ops *ops;

static struct blob_buf bb;
static struct uci_context *cursor;


enum {
	DSLSTATS_BEARER_0 = 0, 
	DSLSTATS_BEARER_COUNT
}; 

enum {
	DSLSTATS_COUNTER_TOTALS, 
	DSLSTATS_COUNTER_CURRENT_15,
	DSLSTATS_COUNTER_PREVIOUS_15, 
	DSLSTATS_COUNTER_CURRENT_DAY,
	DSLSTATS_COUNTER_PREVIOUS_DAY,
	DSLSTATS_COUNTER_SINCE_LINK,
	DSLSTATS_COUNTER_COUNT
}; 

typedef struct { double up; double down; } UpDown; 
typedef struct dsl_bearer {

	UpDown max_rate; 
	UpDown rate; 
	UpDown msgc;  
	UpDown b,m,t,r,s,l,d; 
	UpDown delay; 
	UpDown inp; 
	UpDown sf, sf_err;
	UpDown rs, rs_corr, rs_uncorr;
	UpDown hec, ocd, lcd; 
	UpDown total_cells, data_cells, bit_errors; 
	
} DSLBearer; 

typedef struct dsl_counters {
	UpDown es, ses, uas; 
	UpDown fec, crc; 
} DSLCounters; 

typedef struct dsl_stats {
	char mode[64]; 
	char traffic[64];
	char status[64]; 
	char link_power_state[64]; 
	char line_status[64]; 
	char vdsl2_profile[64]; 
	UpDown trellis; 
	UpDown snr; 
	UpDown pwr; 
	UpDown attn; 
	DSLBearer bearers[DSLSTATS_BEARER_COUNT]; 
	DSLCounters counters[DSLSTATS_COUNTER_COUNT]; 
} DSLStats; 

void dslstats_init(struct dsl_stats *self); 
void dslstats_load(struct dsl_stats *self); 
void dslstats_to_blob_buffer(struct dsl_stats *self, struct blob_buf *b); 
int dslstats_rpc(struct ubus_context *ctx, struct ubus_object *obj, 
	struct ubus_request_data *req, const char *method, 
	struct blob_attr *msg); 
	
#define DSLDEBUG(...) {} //printf(__VA_ARGS__)

void dslstats_init(struct dsl_stats *self){
	*self = (struct dsl_stats){0}; 
}

void dslstats_load(struct dsl_stats *self){
	FILE *fp;
	char line[128];
	char name[64]; 
	char sep[64]; 
	char arg1[64]; 
	char arg2[64]; 
	
	// start with default bearer 0 (we can support more later)
	DSLBearer *bearer = &self->bearers[0]; 
	DSLCounters *counters = &self->counters[0]; 
	int done = 0; 
	
	if(!(fp = popen("xdslctl info --stats", "r"))) return; 
	
	while(!done && fgets(line, sizeof(line), fp) != NULL) {
		DSLDEBUG("LINE: %d, %s, args:%d\n", strlen(line), line, narg); 
		name[0] = 0; arg1[0] = 0; arg2[0] = 0; 
		remove_newline(line);
		int narg = sscanf(line, "%[^\t]%[\t ]%[^\t]%[\t]%[^\t]", name, sep, arg1, sep, arg2); 
		switch(narg){
			case 0: { // sections
				if(strstr(line, "Bearer")){
					int id = 0; 
					if(sscanf(strstr(line, "Bearer"), "Bearer %d", &id) > 0){
						if(id < DSLSTATS_BEARER_COUNT){
							bearer = &self->bearers[id];
							DSLDEBUG("Switching bearer: %d\n", id); 
						}  
					}
				} 
				// it is possible to add more stats like this though
				/*
				else if(strstr(name, "Latest 15 minutes time =") == name) counters = &self->counters[DSLSTATS_COUNTERS_CURRENT_15]; 
				else if(strstr(name, "Previous 15 minutes time =") == name) counters = &self->counters[DSLSTATS_COUNTERS_PREVIOUS_15]; 
				else if(strstr(name, "Latest 1 day time =") == name) counters = &self->counters[DSLSTATS_COUNTERS_CURRENT_DAY]; 
				else if(strstr(name, "Previous 1 day time =") == name) counters = &self->counters[DSLSTATS_COUNTERS_PREVIOUS_DAY]; 
				else if(strstr(name, "Since Link time =") == name) counters = &self->counters[DSLSTATS_COUNTERS_SINCE_LINK]; */
			} break; 
			case 1: { // various one liners
				if(strstr(line, "Total time =") == line) counters = &self->counters[DSLSTATS_COUNTER_TOTALS]; 
				else if(strstr(line, "Latest 15 minutes time =") == line) done = 1; // we stop parsing at this right now
				else if(strstr(line, "Status") == line && strlen(line) > 9) strncpy(self->status, line + 8, sizeof(self->status)); 
			} break; 
			case 3: {
				if(strstr(name, "Link Power State") == name) strncpy(self->link_power_state, arg1, sizeof(self->link_power_state)); 
				else if(strstr(name, "Mode") == name) strncpy(self->mode, arg1, sizeof(self->mode)); 
				else if(strstr(name, "VDSL2 Profile") == name) strncpy(self->vdsl2_profile, arg1, sizeof(self->vdsl2_profile));
				else if(strstr(name, "TPS") == name) strncpy(self->traffic, arg1, sizeof(self->traffic)); 
				else if(strstr(name, "Trellis") == name){
					char tmp[2][64]; 
					if(sscanf(arg1, "U:%s /D:%s", tmp[0], tmp[1])){
						DSLDEBUG("TRELLIS: %s %s\n", tmp[0], tmp[1]); 
						if(strcmp(tmp[0], "ON") == 0) self->trellis.down = 1; 
						else self->trellis.down = 0; 
						if(strcmp(tmp[1], "ON") == 0) self->trellis.up = 1; 
						else self->trellis.up = 0; 
					}
				}
				else if(strstr(name, "Line Status") == name) strncpy(self->line_status, arg1, sizeof(self->line_status)); 
				else if(strstr(name, "Bearer") == name){
					unsigned long id, up, down, ret; 
					if((ret = sscanf(arg1, "%lu, Upstream rate = %lu Kbps, Downstream rate = %lu Kbps", &id, &up, &down)) == 3){
						if(id < DSLSTATS_BEARER_COUNT){
							bearer = &self->bearers[id]; 
							bearer->rate.up = up; 
							bearer->rate.down = down; 
							DSLDEBUG("Switching bearer: %d\n", id); 
						}
					}
				}
				else if(strstr(name, "Max") == name) {
					sscanf(arg1, "Upstream rate = %lf Kbps, Downstream rate = %lf Kbps", &bearer->max_rate.up, &bearer->max_rate.down); 
				}
				DSLDEBUG("PARSED: name:%s, arg1:%s\n", name, arg1); 
			} break; 
			case 5: {
				if(strstr(name, "SNR") == name) {
					self->snr.down = atof(arg1);
					self->snr.up = atof(arg2); 
				}
				else if(strstr(name, "Attn") == name){
					self->attn.down = atof(arg1);
					self->attn.up = atof(arg2); 
				} 
				else if(strstr(name, "Pwr") == name){
					self->pwr.down = atof(arg1); 
					self->pwr.up = atof(arg2); 
				}
				else if(strstr(name, "MSGc") == name){
					bearer->msgc.down = atof(arg1); 
					bearer->msgc.up = atof(arg2); 
				}
				else if(strstr(name, "B:") == name){
					bearer->b.down = atof(arg1); 
					bearer->b.up = atof(arg2); 
				}
				else if(strstr(name, "M:") == name){
					bearer->m.down = atof(arg1); 
					bearer->m.up = atof(arg2); 
				}
				else if(strstr(name, "T:") == name){
					bearer->t.down = atof(arg1); 
					bearer->t.up = atof(arg2); 
				}
				else if(strstr(name, "R:") == name){
					bearer->r.down = atof(arg1); 
					bearer->r.up = atof(arg2); 
				}
				else if(strstr(name, "S:") == name){
					bearer->s.down = atof(arg1); 
					bearer->s.up = atof(arg2); 
				}
				else if(strstr(name, "L:") == name){
					bearer->l.down = atof(arg1); 
					bearer->l.up = atof(arg2); 
				}
				else if(strstr(name, "D:") == name){
					bearer->d.down = atof(arg1); 
					bearer->d.up = atof(arg2); 
				}
				else if(strstr(name, "delay:") == name){
					bearer->delay.down = atof(arg1); 
					bearer->delay.up = atof(arg2); 
				}
				else if(strstr(name, "INP:") == name){
					bearer->inp.down = atof(arg1); 
					bearer->inp.up = atof(arg2); 
				}
				else if(strstr(name, "SF:") == name){
					bearer->sf.down = atoll(arg1); 
					bearer->sf.up = atoll(arg2); 
				}
				else if(strstr(name, "SFErr:") == name){
					bearer->sf_err.down = atoll(arg1); 
					bearer->sf_err.up = atoll(arg2); 
				}
				else if(strstr(name, "RS:") == name){
					bearer->rs.down = atoll(arg1); 
					bearer->rs.up = atoll(arg2); 
				}
				else if(strstr(name, "RSCorr:") == name){
					bearer->rs_corr.down = atoll(arg1); 
					bearer->rs_corr.up = atoll(arg2); 
				}
				else if(strstr(name, "RSUnCorr:") == name){
					bearer->rs_uncorr.down = atoll(arg1); 
					bearer->rs_uncorr.up = atoll(arg2); 
				}
				else if(strstr(name, "HEC:") == name){
					bearer->hec.down = atoll(arg1); 
					bearer->hec.up = atoll(arg2); 
				}
				else if(strstr(name, "OCD:") == name){
					bearer->ocd.down = atoll(arg1); 
					bearer->ocd.up = atoll(arg2); 
				}
				else if(strstr(name, "LCD:") == name){
					bearer->lcd.down = atoll(arg1); 
					bearer->lcd.up = atoll(arg2); 
				}
				else if(strstr(name, "Total Cells:") == name){
					bearer->total_cells.down = atoll(arg1); 
					bearer->total_cells.up = atoll(arg2); 
				}
				else if(strstr(name, "Data Cells:") == name){
					bearer->data_cells.down = atoll(arg1); 
					bearer->data_cells.up = atoll(arg2); 
				}
				else if(strstr(name, "Bit Errors:") == name){
					bearer->bit_errors.down = atoll(arg1); 
					bearer->bit_errors.up = atoll(arg2); 
				}
				else if(strstr(name, "ES:") == name){
					counters->es.down = atoll(arg1); 
					counters->es.up = atoll(arg2); 
				}
				else if(strstr(name, "SES:") == name){
					counters->ses.down = atoll(arg1); 
					counters->ses.up = atoll(arg2); 
				}
				else if(strstr(name, "UAS:") == name){
					counters->uas.down = atoll(arg1); 
					counters->uas.up = atoll(arg2); 
				}
				else if(strstr(name, "FEC:") == name){
					counters->fec.down = atoll(arg1); 
					counters->fec.up = atoll(arg2); 
				}
				else if(strstr(name, "CRC:") == name){
					counters->crc.down = atoll(arg1); 
					counters->crc.up = atoll(arg2); 
				}
				DSLDEBUG("PARSED: name:%s, arg1:%s, arg2:%s\n", name, arg1, arg2); 
			} break; 
			default: {
				DSLDEBUG("ERROR: line:%s, fcnt:%d, name:%s, arg1:%s, arg2:%s\n", line, narg, name, arg1, arg2); 
			}
		}
	}
	
	pclose(fp);
}

void dslstats_free(struct dsl_stats *self){
	
}

void dslstats_to_blob_buffer(struct dsl_stats *self, struct blob_buf *b){
	void *t, *array, *obj;
	DSLBearer *bearer = &self->bearers[0]; 
	DSLCounters *counter = &self->counters[DSLSTATS_COUNTER_TOTALS]; 
	//dslstats_load(self); 
	
	t = blobmsg_open_table(b, "dslstats");
	blobmsg_add_string(b, "mode", self->mode);
	blobmsg_add_string(b, "traffic", self->traffic);
	blobmsg_add_string(b, "status", self->status);
	blobmsg_add_string(b, "link_power_state", self->link_power_state);
	blobmsg_add_string(b, "line_status", self->line_status);
	blobmsg_add_u8(b, "trellis_up", self->trellis.up); 
	blobmsg_add_u8(b, "trellis_down", self->trellis.down); 
	blobmsg_add_u32(b, "snr_up_x100", self->snr.up * 100); 
	blobmsg_add_u32(b, "snr_down_x100", self->snr.down * 100); 
	blobmsg_add_u32(b, "pwr_up_x100", self->pwr.up * 100); 
	blobmsg_add_u32(b, "pwr_down_x100", self->pwr.down * 100); 
	blobmsg_add_u32(b, "attn_up_x100", self->attn.up * 100); 
	blobmsg_add_u32(b, "attn_down_x100", self->attn.down * 100); 
	
	// add bearer data (currently only one bearer)
	array = blobmsg_open_array(b, "bearers"); 
		obj = blobmsg_open_table(b, NULL); 
			blobmsg_add_u32(b, "max_rate_up", bearer->max_rate.up); 
			blobmsg_add_u32(b, "max_rate_down", bearer->max_rate.down); 
			blobmsg_add_u32(b, "rate_up", bearer->rate.up); 
			blobmsg_add_u32(b, "rate_down", bearer->rate.down); 
			blobmsg_add_u32(b, "msgc_up", bearer->msgc.up); 
			blobmsg_add_u32(b, "msgc_down", bearer->msgc.down); 
			blobmsg_add_u32(b, "b_down", bearer->b.down); 
			blobmsg_add_u32(b, "b_up", bearer->b.up); 
			blobmsg_add_u32(b, "m_down", bearer->m.down); 
			blobmsg_add_u32(b, "m_up", bearer->m.up); 
			blobmsg_add_u32(b, "t_down", bearer->t.down); 
			blobmsg_add_u32(b, "t_up", bearer->t.up); 
			blobmsg_add_u32(b, "r_down", bearer->r.down); 
			blobmsg_add_u32(b, "r_up", bearer->r.up); 
			blobmsg_add_u32(b, "s_down_x10000", bearer->s.down * 10000); 
			blobmsg_add_u32(b, "s_up_x10000", bearer->s.up * 10000); 
			blobmsg_add_u32(b, "l_down", bearer->l.down); 
			blobmsg_add_u32(b, "l_up", bearer->l.up); 
			blobmsg_add_u32(b, "d_down", bearer->d.down); 
			blobmsg_add_u32(b, "d_up", bearer->d.up); 
			blobmsg_add_u32(b, "delay_down", bearer->delay.down); 
			blobmsg_add_u32(b, "delay_up", bearer->delay.up); 
			blobmsg_add_u32(b, "inp_down_x100", bearer->inp.down * 100); 
			blobmsg_add_u32(b, "inp_up_x100", bearer->inp.up * 100); 
			blobmsg_add_u64(b, "sf_down", bearer->sf.down); 
			blobmsg_add_u64(b, "sf_up", bearer->sf.up); 
			blobmsg_add_u64(b, "sf_err_down", bearer->sf_err.down); 
			blobmsg_add_u64(b, "sf_err_up", bearer->sf_err.up); 
			blobmsg_add_u64(b, "rs_down", bearer->rs.down); 
			blobmsg_add_u64(b, "rs_up", bearer->rs.up); 
			blobmsg_add_u64(b, "rs_corr_down", bearer->rs_corr.down); 
			blobmsg_add_u64(b, "rs_corr_up", bearer->rs_corr.up); 
			blobmsg_add_u64(b, "rs_uncorr_down", bearer->rs_uncorr.down); 
			blobmsg_add_u64(b, "rs_uncorr_up", bearer->rs_uncorr.up); 
			blobmsg_add_u64(b, "hec_down", bearer->hec.down); 
			blobmsg_add_u64(b, "hec_up", bearer->hec.up); 
			blobmsg_add_u64(b, "ocd_down", bearer->ocd.down); 
			blobmsg_add_u64(b, "ocd_up", bearer->ocd.up); 
			blobmsg_add_u64(b, "lcd_down", bearer->lcd.down); 
			blobmsg_add_u64(b, "lcd_up", bearer->lcd.up); 
			blobmsg_add_u64(b, "total_cells_down", bearer->total_cells.down); 
			blobmsg_add_u64(b, "total_cells_up", bearer->total_cells.up); 
			blobmsg_add_u64(b, "data_cells_down", bearer->data_cells.down); 
			blobmsg_add_u64(b, "data_cells_up", bearer->data_cells.up); 
			blobmsg_add_u64(b, "bit_errors_down", bearer->bit_errors.down); 
			blobmsg_add_u64(b, "bit_errors_up", bearer->bit_errors.up); 
		blobmsg_close_table(b, obj); 
	blobmsg_close_array(b, array); 
	
	// add counter data (currently only totals)
	//counter = &self->counters[DSLSTATS_COUNTER_TOTALS]; 
	array = blobmsg_open_table(b, "counters"); 
		obj = blobmsg_open_table(b, "totals"); 
			blobmsg_add_u64(b, "fec_down", counter->fec.down); 
			blobmsg_add_u64(b, "fec_up", counter->fec.up); 
			blobmsg_add_u64(b, "crc_down", counter->crc.down); 
			blobmsg_add_u64(b, "crc_up", counter->crc.up); 
			blobmsg_add_u64(b, "es_down", counter->es.down); 
			blobmsg_add_u64(b, "es_up", counter->es.up); 
			blobmsg_add_u64(b, "ses_down", counter->ses.down); 
			blobmsg_add_u64(b, "ses_up", counter->ses.up); 
			blobmsg_add_u64(b, "uas_down", counter->uas.down); 
			blobmsg_add_u64(b, "uas_up", counter->uas.up); 
		blobmsg_close_table(b, obj); 
	blobmsg_close_array(b, array); 
	
	blobmsg_close_table(b, t);
}


int dslstats_rpc(struct ubus_context *ctx, struct ubus_object *obj, 
	struct ubus_request_data *req, const char *method, 
	struct blob_attr *msg){
	static struct blob_buf bb;
	static struct dsl_stats dslstats;
	
	dslstats_init(&dslstats); 
	blob_buf_init(&bb, 0); 
	
	dslstats_load(&dslstats);
	dslstats_to_blob_buffer(&dslstats, &bb); 
	
	ubus_send_reply(ctx, req, bb.head); 
	
	dslstats_free(&dslstats); 
	
	return 0; 	
}

static int
rpc_api_init(const struct rpc_daemon_ops *o, struct ubus_context *ctx)
{
	int rv = 0;

	static struct ubus_method dsl_object_methods[] = {
		UBUS_METHOD_NOARG("status", dslstats_rpc)
	};

	static struct ubus_object_type dsl_object_type =
		UBUS_OBJECT_TYPE("broadcom-dsl-type", dsl_object_methods);

	static struct ubus_object dsl_object = {
		.name = "juci.broadcom.dsl",
		.type = &dsl_object_type,
		.methods = dsl_object_methods,
		.n_methods = ARRAY_SIZE(dsl_object_methods),
	};

	cursor = uci_alloc_context();

	if (!cursor)
		return UBUS_STATUS_UNKNOWN_ERROR;

	ops = o;

	rv |= ubus_add_object(ctx, &dsl_object);

	return rv;
}

struct rpc_plugin rpc_plugin = {
	.init = rpc_api_init
};
