jQuery(function($, undefined) {
	$(document).ready(function(){
		(function($) {
			$.fn.tilda = function(eval, options) {
				if ($('body').data('tilda')) {
						return $('body').data('tilda').terminal;
				}
				this.addClass('tilda');
				options = options || {};
				eval = eval || function(command, term) {
						term.echo("you don't set eval for tilda");
				};
				var settings = {
						prompt: 'JUCI> ',
						name: 'juci',
						height: 300,
						enabled: false,
						greetings: 'JUCI Command Console',
						keypress: function(e) {
								if (e.which == 167) {
										return false;
								}
						}
				};
				if (options) {
						$.extend(settings, options);
				}
				this.append('<div class="td"></div>');
				var self = this;
				self.terminal = this.find('.td').terminal(eval,
																							 settings);
				var focus = false;
				$(document.documentElement).keypress(function(e) {
					if (e.charCode == 167) { // §
						self.slideToggle('fast');
						self.terminal.focus(focus = !focus);
					}
				});
				$('body').data('tilda', this);
				this.hide();
				return self;
			};
    })(jQuery);
    $("body").append('<div id="tilda"></div>'); 
    $('#tilda').tilda(function(command, terminal) {
      if (command !== '') {
				try {
					var result = window.eval(command);
					if (result !== undefined) {
						terminal.echo(new String(result));
					}
				} catch(e) {
					terminal.error(new String(e));
				}
			} else {
				 term.echo('');
			}
    });
	}); 
});
