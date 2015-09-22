#!/usr/bin/lua

require("JUCI"); 

-- Status: Showtime
-- Last Retrain Reason:    1
-- Last initialization procedure status:   0
-- Max:    Upstream rate = 560 Kbps, Downstream rate = 15281 Kbps
-- Bearer: 0, Upstream rate = 560 Kbps, Downstream rate = 13576 Kbps
-- 
-- Link Power State:       L0
-- Mode:                   ADSL2+ Annex A
-- TPS-TC:                 ATM Mode(0x0)
-- Trellis:                U:ON /D:ON
-- Line Status:            No Defect
-- Training Status:        Showtime
--                Down            Up
--				SNR (dB):        8.6             5.4
--				Attn(dB):        22.0            42.1
--				Pwr(dBm):        18.8            12.3

string.split = function (str, pattern)
    local parts = {}; 
	for part in string.gmatch(str, pattern) do
		table.insert(parts, part); 
	end
	return parts
end

function dsl_stats()
	-- until we make it a lua script
	-- local res = juci.shell("ubus call juci.broadcom.dsl.bin status"); 
	local lines = juci.shell("xdslctl info --stats | awk 'BEGIN{FS=\"[:\t]+\"}{gsub(/^[ \t]+/,\"\",$2);gsub(/[ \t]+$/,\"\",$2);print $1 \"\t\" $2 \"\t\" $3 \"\t\" $4 \"\t\"; }'"); 
	local brr = {}; 
	local ctr = {}; 
	local bearers = {}; 
	local res = { bearers = bearers, counters = { totals = ctr } };  
	local stats = {res = res}; 
		
	for line in lines:gmatch("[^\r\n]+") do
		local parts = string.split(line, "[^\t]+"); 
		if(parts[1] == "Status") then res.status = parts[2]; 
		elseif(parts[1] == "Link Power State") then res.link_power_state = parts[2]; 
		elseif(parts[1] == "Mode") then res.mode = parts[2]; 
		elseif(parts[1] == "VDSL2 Profile") then res.vdsl2_profile = parts[2]; 
		elseif(parts[1] == "TPS-TC") then res.traffic = parts[2]; 
		elseif(parts[1] == "Line Status") then res.line_status = parts[2]; 
		elseif(parts[1] == "SNR (dB)") then res.snr_down = parts[2]; res.snr_up = parts[3]; 
		elseif(parts[1] == "Attn(dB)") then res.attn_down = parts[2]; res.attn_up = parts[3]; 
		elseif(parts[1] == "Pwr(dBm)") then res.pwr_down = parts[2]; res.pwr_up = parts[3]; 
		elseif(parts[1] == "Bearer") then 
			brr = {
				rate_up = 0, 
				rate_down = 0
			}; 
			brr.rate_up,brr.rate_down = string.match(line, "Upstream rate = (%d+) Kbps,%s+Downstream rate = (%d+) Kbps"); 		
			table.insert(bearers, brr);  
		elseif(parts[1] == "MSGc") then brr.msgc_down = parts[2]; brr.msgc_up = parts[3]; 
		elseif(parts[1] == "B") then brr.b_down = parts[2]; brr.b_up = parts[3]; 
		elseif(parts[1] == "M") then brr.m_down = parts[2]; brr.m_up = parts[3]; 
		elseif(parts[1] == "T") then brr.t_down = parts[2]; brr.t_up = parts[3]; 
		elseif(parts[1] == "R") then brr.r_down = parts[2]; brr.r_up = parts[3]; 
		elseif(parts[1] == "S") then brr.s_down = parts[2]; brr.s_up = parts[3]; 
		elseif(parts[1] == "L") then brr.l_down = parts[2]; brr.l_up = parts[3]; 
		elseif(parts[1] == "D") then brr.d_down = parts[2]; brr.d_up = parts[3]; 
		elseif(parts[1] == "delay") then brr.delay_down = parts[2]; brr.delay_up = parts[3]; 
		elseif(parts[1] == "INP") then brr.inp_down = parts[2]; brr.inp_up = parts[3]; 
		elseif(parts[1] == "SF") then brr.sf_down = parts[2]; brr.sf_up = parts[3]; 
		elseif(parts[1] == "SFErr") then brr.sferr_down = parts[2]; brr.sferr_up = parts[3]; 
		elseif(parts[1] == "RS") then brr.rs_down = parts[2]; brr.rs_up = parts[3]; 
		elseif(parts[1] == "RSCorr") then brr.rscorr_down = parts[2]; brr.rscorr_up = parts[3]; 
		elseif(parts[1] == "RSUnCorr") then brr.rsuncorr_down = parts[2]; brr.rsuncorr_up = parts[3]; 
		elseif(parts[1] == "HEC") then brr.hec_down = parts[2]; brr.hec_up = parts[3]; 
		elseif(parts[1] == "OCD") then brr.ocd_down = parts[2]; brr.ocd_up = parts[3]; 
		elseif(parts[1] == "LCD") then brr.lcd_down = parts[2]; brr.lcd_up = parts[3]; 
		elseif(parts[1] == "Total Cells") then brr.total_cells_down = parts[2]; brr.total_cells_up = parts[3]; 
		elseif(parts[1] == "Data Cells") then brr.data_cells_down = parts[2]; brr.data_cells_up = parts[3]; 
		elseif(parts[1] == "Bit Errors") then brr.bit_errors_down = parts[2]; brr.bit_errors_up = parts[3]; 
		elseif(parts[1] == "ES") then ctr.es_down = parts[2]; ctr.es_up = parts[3]; 
		elseif(parts[1] == "SES") then ctr.ses_down = parts[2]; ctr.ses_up = parts[3]; 
		elseif(parts[1] == "UAS") then ctr.uas_down = parts[2]; ctr.uas_up = parts[3]; 
		elseif(parts[1] == "FEC") then ctr.fec_down = parts[2]; ctr.fec_up = parts[3]; 
		elseif(parts[1] == "CRC") then ctr.crc_down = parts[2]; ctr.crc_up = parts[3]; 
		end
	end
	print(json.encode({dslstats = res})); 
end

juci.ubus({
	["status"] = dsl_stats
}, arg); 
