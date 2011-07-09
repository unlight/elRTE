jQuery(document).ready(function(){
	if ($.browser.msie) return; 
	if (typeof($.livequery) != 'function') return;
	
	var WebRoot = gdn.definition('WebRoot');
	
	// Make elfinder dialog some wider.
	$('body > div.ui-dialog').livequery(function(){
		if ($(this).width() < 700) $(this).width(700).center();
	});
	
	// elRTE settings.
	var ElRteSettings = {
		//doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
		absoluteURLs: false,
		allowSource: true,
		styleWithCSS: false,
		toolbar: 'RtePluginToolbar',
		height: 400,
		fmAllow: !!gdn.definition('FileManagerAllow', false),
		lang: gdn.definition('LocaleLanguageCode', 'en'),
		fmOpen : function(callback) {
			$('<div id="myelfinder" />').elfinder({
				url: gdn.url('plugin/elfinderconnector'),
				lang: gdn.definition('LocaleLanguageCode', 'en'),
				dialog: {width: '95%', modal: true, title: ''},
				closeOnEditorCallback: true,
				editorCallback: callback
			});
		}
	}
	
	var AddCssFile = function(file, webroot) {
		var link = $('<link>', {rel: 'stylesheet', type: 'text/css', media: 'screen', charset:'utf-8'});
		if (typeof(webroot) != 'undefined') file = gdn.combinePaths(webroot, file);
		$(link).attr('href', file);
		$('head').append(link);
	}
	
	var AddJsFile = function(file, webroot) {
		var script = $('<script>', {type: 'text/javascript', charset: 'utf-8'});
		if (typeof(webroot) != 'undefined') file = gdn.combinePaths(webroot, file);
		$(script).attr('src', file);
		$('head').append(script);
	}
	
	var LoadElRte = function() {
		if ($('body').data('bElRteLoaded')) return;
		$('body').data('bElRteLoaded', true);
		var lang = gdn.definition('LocaleLanguageCode', 'en');
		var RteRoot = gdn.combinePaths(WebRoot, 'plugins/elRTE/vendors/elrte/');
		var CdnServer = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/';
		AddJsFile('jquery-ui.min.js', CdnServer);
		AddCssFile('themes/smoothness/jquery-ui.css', CdnServer);
		AddCssFile('css/elrte.min.css', RteRoot);
		AddJsFile('js/elrte.min.js', RteRoot);
		AddJsFile('js/i18n/elrte.'+lang+'.js', RteRoot);
		var elfinder = !!gdn.definition('FileManagerAllow', false);
		if (elfinder) {
			var EfRoot = gdn.combinePaths(WebRoot, 'plugins/elRTE/vendors/elfinder/');
			AddCssFile('css/elfinder.css', EfRoot);
			AddJsFile('js/elfinder.min.js', EfRoot);
			AddJsFile('js/i18n/elfinder.'+lang+'.js', EfRoot);			
		}
	}
	
	var ElRteLoading = function(){
		return (typeof(elRTE) != "undefined");
	}
	
	var TransformTextArea = function(TextareaId) {
		var t = $("#"+TextareaId);
		var p = elRTE.prototype.options.panels;
		// Add custom panels.
		p.CopyPaste = ['pastetext', 'pasteformattext', 'removeformat', 'docstructure'];
		p.TextDecoration = ['bold', 'italic', 'underline'];
		p.TextAlign = ['justifyleft', 'justifycenter', 'justifyright'];
		p.FormatHeaders = ['formatblock'];
		p.List = ['insertorderedlist', 'insertunorderedlist'];
		p.Renders = ['link', 'unlink', 'image']; // anchor
		p.Misc = ['elfinder', 'fullscreen'];
		
		elRTE.prototype.options.toolbars.RtePluginToolbar = [
			'CopyPaste', 'undoredo', 'TextDecoration', 'TextAlign', 'FormatHeaders', 'List', 'Renders', 'Misc'
		];
		
		ElRteSettings.height = $(t).height();
		
		$(t).unbind();
		var rte = t.is(':hidden');
		
		if (!rte) {
			t.elrte(ElRteSettings);
		} else { // TODO: FIX ME, CANT RE-ENABLE WYSIWYG
			t.elrte('updateSource');
			//$(pp).find('div.el-rte').replaceWith(t);
			//t.show();
		}
		
	}
	
	$("textarea").each(function(){
		var TextareaId = $(this).attr('id');
		$(this).tipsy({
			title: function(){
				return '<span class="elRteTrigger" id="elRteTrigger'+TextareaId+'">WYSIWYG</span>';
			},
			fade: true,
			html: true,
			//delayOut: 1111450,
			//live: false,
			trigger: 'focus',
			gravity: $.fn.tipsy.autoWE
		});
	});
	
	// Tooltip-trigger click handler.
	$('span[id^=elRteTrigger]').livequery(function(){
		$(this).click(function() {
			var TextareaId = this.id.substr(12);
			LoadElRte();		
			jQuery.doWhen(ElRteLoading, TransformTextArea, {data: TextareaId});
		});
	});
});

// jQuery center.

if (typeof(jQuery.fn.center) == 'undefined') {
	jQuery.fn.center = function() {
		this.css("position", "absolute");
		var w = $(window);
		var t = (w.height() - this.height()) / 2 + w.scrollTop();
		this.css("top", t + "px");
		this.css("left",(w.width()-this.width())/2+w.scrollLeft() + "px");
		return this;
	}
}
