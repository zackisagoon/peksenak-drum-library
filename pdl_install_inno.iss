[Setup]
AppName=Peksenak Drum Library
AppVersion=1.0.0
DefaultGroupName=Zachary Pierce
DefaultDirName={userappdata}\Zachary Pierce\Peksenak Drum Library
UsePreviousAppDir=yes
OutputDir=.\installerBuild
PrivilegesRequired=admin
OutputBaseFilename=PeksenakDL Installer 1.0.0
Uninstallable=yes
CreateUninstallRegKey=yes
UninstallFilesDir={userappdata}\Zachary Pierce\Peksenak Drum Library
LicenseFile=.\installerAssets\EULA.txt
SetupIconFile=.\installerAssets\zpicon.ico
WizardSmallImageFile=.\installerAssets\Logo147x147.bmp
WizardImageFile=.\installerAssets\Logo240x459.bmp

[Files]
Source: ".\installerAssets\Peksenak Drum Libarary_manual.pdf"; DestDir: "{commoncf}\VST3\Zachary Pierce\Peksenak Drum Library"; Flags: ignoreversion
Source: ".\PooledResources\ImageResources.dat"; DestDir: "{userappdata}\Zachary Pierce\Peksenak Drum Library"; Flags: ignoreversion
Source: ".\PooledResources\AudioResources.dat"; DestDir: "{userappdata}\Zachary Pierce\Peksenak Drum Library"; Flags: ignoreversion
Source: ".\Binaries\Compiled\VST3\Peksenak Drum Library.vst3"; DestDir: "{commoncf}\VST3\Zachary Pierce\Peksenak Drum Library"; Flags: ignoreversion
Source: ".\Samples\*"; Excludes: "Raw"; DestDir: "{commoncf}\VST3\Zachary Pierce\Peksenak Drum Library\Peksenak Drum Library Samples"; Flags: ignoreversion

[Icons]
Name: "{group}\User guide"; Filename: "{userappdata}\Zachary Pierce\Peksenak Drum Library\Peksenak Drum Libarary_manual.pdf"
Name: "{group}\Uninstall Peksenak_DL"; Filename: "{userappdata}\Zachary Pierce\Peksenak Drum Library\unins000.exe"

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  LinkWindowsFilePath: string;
  LinkWindowsFileContent: string;
  SampleDirectory: string;
  BaseDirectory: string;
begin
  if CurStep = ssInstall then
  begin
    BaseDirectory := ExpandConstant('{userappdata}\Zachary Pierce\Peksenak Drum Library');
    ForceDirectories(BaseDirectory);

    LinkWindowsFilePath := BaseDirectory + '\LinkWindows';
    if FileExists(LinkWindowsFilePath) then
      DeleteFile(LinkWindowsFilePath);

    SampleDirectory := ExpandConstant('{commoncf}\VST3\Zachary Pierce\Peksenak Drum Library\Peksenak Drum Library Samples');

    LinkWindowsFileContent := SampleDirectory;

    SaveStringToFile(LinkWindowsFilePath, LinkWindowsFileContent, False);
  end
end;