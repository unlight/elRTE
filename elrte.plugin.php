<?php if (!defined('APPLICATION')) exit();

$PluginInfo['elRTE'] = array(
	'Name' => 'elRTE',
	'Description' => 'elRTE is an open-source WYSIWYG HTML-editor written in JavaScript using jQuery UI.',
	'Version' => '1.0.0',
	'Date' => '8 Jan 2011',
	'Author' => 'Hrusha',
	'RegisterPermissions' => array(
		'Plugins.ElRte.Wysiwyg.Allow',
		'Plugins.ElRte.FileManager.Allow',
		'Plugins.ElRte.FileManager.Root',
		// TODO: Group permissions
		//'Plugins.ElRte.FileManager.Group',
		//'Plugins.ElRte.FileManager.GroupFiles',
		'Plugins.ElRte.FileManager.Files.Read',
		'Plugins.ElRte.FileManager.Files.Write',
		'Plugins.ElRte.FileManager.Files.Remove'
	)
);

class ElRtePlugin extends Gdn_Plugin {
	
/*	public function __construct() {
	}*/
	
	protected static function LocaleLanguageCode() {
		$T = preg_split('/[_-]/', Gdn::Locale()->Current());
		return ArrayValue(0, $T, 'en');
	}
	
	public function PluginController_ElFinderConnector_Create($Sender) {
		require_once dirname(__FILE__).'/class.filemanager.php';
		$Options = self::GetOptions();
		$FileManager = new ElFinderFileManager($Options);
		$FileManager->Run();
	}
	
	protected static function GetOptions() {
		
		$DS = DIRECTORY_SEPARATOR;
		$Options = array();
		$Defaults = array('read'  => True, 'write' => False, 'rm' => False);
		$DefaultOptions = array(
			'root' => Null,
			'tmbDir' => '.thumbnails',
			'defaults' => $Defaults,
			'perms' => array()
		);
		// TODO: $CustomPermissions
		// $All = array('read'  => True, 'write' => True, 'rm' => True);
/*		$NowYear = date('Y');
		$CustomPermissions = array(
			"~$NowYear{$DS}.*~" => $All
		);*/
		
		$Session = Gdn::Session();
	
		if ($Session->CheckPermission('Plugins.ElRte.Wysiwyg.Allow')) {
			$Options['defaults'] = $Defaults;
			$Names = array('Read', 'Write', 'Remove');
			$Names = array_merge(array_combine($Names, $Names), array('Remove' => 'rm'));
			foreach ($Names as $Name => $Perm) {
				$Check = $Session->CheckPermission('Plugins.ElRte.FileManager.Files.'.$Name);
				$Options['defaults'][strtolower($Perm)] = (bool)$Check;
			}
			
			if ($Session->CheckPermission('Plugins.ElRte.FileManager.Root')) {
				$Options['root'] = 'uploads';
				$Options['URL'] = Url('uploads'). '/';
			} elseif ($Session->CheckPermission('Plugins.ElRte.FileManager.Allow')) {
				$UserID = GetValueR('User.UserID', $Session, 0);
				if (!$UserID || $UserID <= 0) throw new Exception('UserID is none.');
				$Folder = 'uploads/userfiles/'.$UserID;
				if (!is_dir($Folder)) mkdir($Folder);
				$Options['root'] = $Folder;
				$Options['URL'] = Url($Folder). '/';
			}
		}
		$Options = array_merge($DefaultOptions, $Options);
		return $Options;
	}
	
	public function Base_Render_Before($Sender) {
		if (!($Sender->DeliveryType() == DELIVERY_TYPE_ALL 
			&& $Sender->SyndicationMethod == SYNDICATION_NONE)) return;
		
		$Session = Gdn::Session();
		if ($Session->CheckPermission('Plugins.ElRte.Wysiwyg.Allow')) {
			$Sender->AddDefinition('LocaleLanguageCode', self::LocaleLanguageCode());
			$Sender->AddDefinition('ElRteVendorWebRoot', $this->GetWebResource('elrte-1.2'));
			
			if ($Session->CheckPermission('Plugins.ElRte.FileManager.Allow')) {
				$Sender->AddDefinition('ElFinderVendorWebRoot', $this->GetWebResource('elfinder-1.1'));
			}
			
			$Sender->AddJsFile($this->GetWebResource('elrte.functions.js'));
			$Sender->AddCssFile($this->GetWebResource('design/elrte.plugin.css'));
		}

	}
	
	public function Setup() {
	}
}