JUCI DSL backend plugin
=======================

This plugin provides dsl specific rpc methods for juci frontend. Underneath this module uses xdslctl command to get the runtime information. 

METHODS
--------

	juci.broadcom.dsl:
		status - gives status of the dsl connection. 
			Return: 
			{
				"dslstats": {
					"mode": "ADSL2+ Annex A", // dsl mode
					"traffic": "ATM Mode(0x0)", // dsl traffic mode
					"status": "Showtime", // dsl line status
					"link_power_state": "L0", 
					"line_status": "No Defect",
					"trellis_up": true,
					"trellis_down": true,
					"snr_up_x100": 500,
					"snr_down_x100": 600,
					"pwr_up_x100": 1230,
					"pwr_down_x100": 1880,
					"attn_up_x100": 4250,
					"attn_down_x100": 2200,
					"bearers": [ // list of bearers (can be more than one but currently only one is ever returned) 
						{
							"max_rate_up": 538,
							"max_rate_down": 13983,
							"rate_up": 537,
							"rate_down": 14048,
							"msgc_up": 17,
							"msgc_down": 51,
							"b_down": 231,
							"b_up": 14,
							"m_down": 1,
							"m_up": 1,
							"t_down": 2,
							"t_up": 3,
							"r_down": 0,
							"r_up": 0,
							"s_down_x10000": 5704,
							"s_up_x10000": 9449,
							"l_down": 3254,
							"l_up": 127,
							"d_down": 1,
							"d_up": 1,
							"delay_down": 0,
							"delay_up": 0,
							"inp_down_x100": 0,
							"inp_up_x100": 0,
							"sf_down": 345534,
							"sf_up": 344667,
							"sf_err_down": 12094,
							"sf_err_up": 13167,
							"rs_down": 0,
							"rs_up": 2301941,
							"rs_corr_down": 0,
							"rs_corr_up": 0,
							"rs_uncorr_down": 0,
							"rs_uncorr_up": 0,
							"hec_down": 13839,
							"hec_up": 4062,
							"ocd_down": 0,
							"ocd_up": 0,
							"lcd_down": 0,
							"lcd_up": 0,
							"total_cells_down": 186090469,
							"total_cells_up": 7110952,
							"data_cells_down": 233237,
							"data_cells_up": 15137,
							"bit_errors_down": 2599360,
							"bit_errors_up": 574367
						}
					],
					"counters": {
						"totals": {
							"fec_down": 0,
							"fec_up": 0,
							"crc_down": 12094,
							"crc_up": 13167,
							"es_down": 4650,
							"es_up": 5120,
							"ses_down": 0,
							"ses_up": 0,
							"uas_down": 247,
							"uas_up": 247
						}
					}
				}
			}
