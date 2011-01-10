var RtePlugin = {
	
	bElRteLoaded: false,
	
	AddCssFile: function(file, webroot) {
		var link, filepath = '';
		link = $('<link>', {rel: 'stylesheet', type: 'text/css', media: 'screen', charset:'utf-8'});
		if (webroot) filepath = webroot + '/';
		filepath += file;
		filepath = filepath.replace(/\/\//, '/').replace(/\/\//, '/');
		$(link).attr('href', filepath);
		$('head').append(link);
	},
	
	AddJsFile: function(file, webroot) {
		var script = $('<script>', {type: 'text/javascript', charset:'utf-8'});
		var filepath = '';
		if (webroot) filepath = webroot + '/';
		filepath += file;
		filepath = filepath.replace(/\/\//, '/').replace(/\/\//, '/');
		$(script).attr('src', filepath);
		$('head').append(script);
	},
	
	LoadElRte: function() {
		var self = RtePlugin;
		if (self.bElRteLoaded) return;
		self.bElRteLoaded = true;
		lang = gdn.definition('LocaleLanguageCode', 'en');
		
		var rteroot = gdn.definition('ElRteVendorWebRoot');
		self.AddCssFile('css/smoothness/jquery-ui-1.8.7.custom.css', rteroot);
		self.AddCssFile('css/elrte.min.css', rteroot);
		self.AddJsFile('js/jquery-ui-1.8.7.custom.min.js', rteroot);
		self.AddJsFile('js/elrte.min.js', rteroot);
		self.AddJsFile('js/i18n/elrte.'+lang+'.js', rteroot);
		
		var elfinderwebroot = gdn.definition('ElFinderVendorWebRoot', false);
		if (elfinderwebroot != false) {
			self.AddCssFile('js/ui-themes/base/ui.all.css', elfinderwebroot);
			self.AddCssFile('css/elfinder.css', elfinderwebroot);
			self.AddJsFile('js/elfinder.min.js', elfinderwebroot);
			self.AddJsFile('js/i18n/elfinder.'+lang+'.js', elfinderwebroot);			
		}
	},
	
	StickTextarea: function(index, element) {
		var self = RtePlugin;
		var Wrap = $('<span>', {'class':'RteWrap'});
		var id = $(element).attr('id');
		var label = $('label[for='+id+']', $(this).parent());
		// 1. textarea has label
		if (label.length > 0) {
			label = label.first();
			var button = $('<span>', {'class':'RteButtonC', html:'Ω'});
			button.bind('click', self.ClickToggleHandler);
			label.append(button);
			return;
		}
		// 2. textarea without label
		$(element).wrap(Wrap);
		$(element).after($('<span>', {html:'Ω', click: self.ClickToggleHandler}));
	},
	
	AddChunkButtonsToTextarea: function() {
		// this script does not work in Internet Explorer
		if ($.browser.msie) return; 
		$("textarea").each(RtePlugin.StickTextarea);
	},
	
	AddCustomPanels: function() {
		var p = elRTE.prototype.options.panels;
		p.CopyPaste = ['pastetext', 'pasteformattext', 'removeformat', 'docstructure'];
		p.TextDecoration = ['bold', 'italic', 'underline'];
		p.TextAlign = ['justifyleft', 'justifycenter', 'justifyright'];
		p.FormatHeaders = ['formatblock'];
		p.List = ['insertorderedlist', 'insertunorderedlist'];
		p.Renders = ['link', 'unlink', 'image']; // anchor
		p.Misc = ['elfinder', 'fullscreen'];
	},
	
	ClickToggleHandler: function() {
		if ($.browser.msie) return alert('Sorry, you are using Internet Explorer.');
		var self = RtePlugin;
		if (!self.bElRteLoaded) self.LoadElRte();
		self.AddCustomPanels();
		elRTE.prototype.options.toolbars.RtePluginToolbar = [
			'CopyPaste', 'undoredo', 'TextDecoration', 'TextAlign', 'FormatHeaders', 'List', 'Renders', 'Misc'
		];
		
		var lang = gdn.definition('LocaleLanguageCode', 'en');
		var elfinder = gdn.definition('ElFinderVendorWebRoot', false);
		elfinder = !!elfinder;
		
		var options = {
			doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
			absoluteURLs: false,
			allowSource: true,
			styleWithCSS: false,
			fmAllow: elfinder,
			toolbar: 'RtePluginToolbar',
			height:400,
			lang: lang,
			fmOpen : function(callback) {
				$('<div id="myelfinder" />').elfinder({
					url: gdn.url('/plugin/elfinderconnector'),
					lang: lang,
					dialog: {width: '95%', modal: true, title: ''},
					closeOnEditorCallback: true,
					editorCallback: callback
				});
			}
		};
		var pp = $(this).parent().parent();
		//console.log(this, pp);
		var t = pp.find('textarea').first();
		options.height = $(t).height();
		
		var rte = t.is(':hidden');
		
		if (!rte) {
			t.elrte(options);
		} else { // TODO: FIX ME, CANT RE-ENABLE WYSIWYG
			t.elrte('updateSource');
			$(pp).find('div.el-rte').replaceWith(t);
			t.show();
		}
	}
};

jQuery(document).ready(RtePlugin.AddChunkButtonsToTextarea);
