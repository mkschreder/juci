//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatsCtrl", function($scope, $rpc, gettext, $tr){
		$scope.dslstats = {}; 
		
		$scope.dslConnectionInfo = {
			title: "test", 
			rows: [[$tr("None"), $tr("None")]]
		}; 
		$scope.dslModeInfo = {
			rows: [[$tr('None'), $tr("None")]]
		}; 
		$scope.dslStatusInfo = {
			rows: []
		}; 
		$scope.dslRateInfo = {
			rows: []
		}; 
		$scope.dslOpInfo = {
			rows: []
		}; 
		$scope.dslErrorInfo = {
			rows: []
		}; 
		$scope.dslCellInfo = {
			rows: []
		}; 
		
		JUCI.interval.repeat("dslstatus", 1000, function(done){
			$rpc.juci.broadcom.dsl.status().done(function(dslstats){
				dslstats = dslstats.dslstats; 
				
				// compute floating point values (because ubus blobs do not support floats yet)
				function reconstruct_floats(obj) {
					for (var property in obj) {
						if (obj.hasOwnProperty(property)) {
							if (typeof obj[property] == "object") {
								reconstruct_floats(obj[property]);
							} else {
								var matches = property.match(/(.*)_x([\d]*)/); 
								if(matches && matches.length == 3){
									try {
										obj[matches[1]] = parseFloat(String(obj[property])) / parseFloat(matches[2]); 
									} catch(e) {
										obj[matches[1]] = "Err"; 
									}
								}
							}
						}
					} 
				}
				reconstruct_floats(dslstats); 
				
				$scope.online = dslstats.status && dslstats.status.length > 0; 
				
				// todo fields
				with({dslstats: dslstats}){
					dslstats.ip = "TODO"; 
					dslstats.ipstate = "TODO"; 
					dslstats.mode_details = "TODO"; 
					dslstats.line_status_configured = "TODO"; 
					dslstats.line_type_configured = "TODO"; 
					dslstats.line_type = "TODO"; 
				}
				
				$scope.tables = [
					{ 
						title: gettext("DSL Status Information"), 
						columns: [ '', '', 'Current' ], 
						rows: [
							[ gettext("Line Status"), "", dslstats.status ]
						]
					}
				]; 
				if(dslstats.status == "Showtime"){
					$scope.tables = $scope.tables.concat([
						{ 
							title: gettext("DSL Mode"), 
							columns: ["", "", "Current"], 
							rows: [
								[ dslstats.mode, "", dslstats.traffic ]
							]
						}, 
						{ 
							title: gettext("Bit Rate"), 
							columns: [ '', 'Downstream', 'Upstream' ], 
							rows: [
								[ gettext('Actual Data Rate'), dslstats.bearers[0].rate_down, dslstats.bearers[0].rate_up ]
							]
						}, 
						{ 
							title: gettext("Operating Data"), 
							columns: [ '', 'Downstream', 'Upstream' ], 
							rows: [
								[ gettext('SNR Margin'), dslstats.snr_down, dslstats.snr_up ],
								[ gettext('Loop Attenuation'), dslstats.attn_down, dslstats.attn_up ]
							]
						}, 
						{ 
							title: gettext("Error Counter"), 
							columns: [ '', 'Downstream', 'Upstream' ], 
							rows: [
								[ gettext('FEC Corrections'), dslstats.counters.totals.fec_down, dslstats.counters.totals.fec_up ],
								[ gettext('CRC Errors'), dslstats.counters.totals.crc_down, dslstats.counters.totals.crc_up ]
							]
						}, 
						{ 
							title: gettext("Cell Statistics"), 
							columns: [ '', 'Transmitted', 'Received' ], 
							rows: [
								[ gettext('Cell Counter'), dslstats.bearers[0].total_cells_down, dslstats.bearers[0].total_cells_up ]
							]
						}
					]); 
				}
				$scope.dslstats = dslstats; 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
