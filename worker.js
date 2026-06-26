addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // চেক করা হচ্ছে রিকোয়েস্টটি PowerShell থেকে এসেছে কি না
  if (userAgent.includes('PowerShell') || userAgent.includes('WindowsPowerShell')) {
    
    // উইন্ডোজ ডিফল্ট সেটিংস রিসেট করার জন্য পাওয়ারশেল রোলব্যাক স্ক্রিপ্ট
    const powerShellScript = `# ==============================================================================
# REGIX PERFORMANCE OPTIMIZATION ROLLBACK & RESTORE SCRIPT
# Environment Restored for: Jahid Ekbal Mallick (REGIX / GURU ESPORTS)
# Powered by: REGIX Studio | Developed by: jahid
# Discord Support: https://discord.gg/zZwDv7ks5W
# Description: Restores all registry tweaks, BCD timers, and services to Windows defaults.
# ==============================================================================

# ১. এডমিনিস্ট্রেটর প্রিভিলেজ চেক (Administrator Privilege Check)
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please right-click and run PowerShell as Administrator to execute this script!"
    Exit
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      REGIX SYSTEM RESTORE ENGINE ACTIVATING...     " -ForegroundColor Cyan
Write-Host "         Powered by: REGIX Studio                   " -ForegroundColor Green
Write-Host "         Developed by: jahid                        " -ForegroundColor Yellow
Write-Host "         Discord: https://discord.gg/zZwDv7ks5W     " -ForegroundColor Magenta
Write-Host "====================================================" -ForegroundColor Cyan

# ২. কার্নেল ক্লক ও টাইমার ডিফল্ট অবস্থায় ফিরিয়ে আনা (Reset BCD Timers)
Write-Host "[1/5] Resetting BCD Kernel Clock & Timers to Windows defaults..." -ForegroundColor Yellow
bcdedit /set disabledynamictick no 2>$null
bcdedit /deletevalue useplatformclock 2>$null
bcdedit /set useplatformtick no 2>$null

# ৩. রেজিস্ট্রি সেটিংস ডিফল্ট করা (Restoring Registry Defaults)
Write-Host "[2/5] Restoring registry keys for Mouse, Network, and GPU priority..." -ForegroundColor Yellow

function Set-RegKey {
    param ($Path, $Name, $Value, $Type = "String")
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type $Type -Force | Out-Null
}

# মাউস রেসপন্স ও এক্সিলারেশন ডিফল্ট করা (Windows Standard Mouse Curves)
$MousePath = "HKCU:\\Control Panel\\Mouse"
Set-RegKey $MousePath "MouseSpeed" "1"
Set-RegKey $MousePath "MouseThreshold1" "6"
Set-RegKey $MousePath "MouseThreshold2" "10"
Set-RegKey $MousePath "MouseSensitivity" "10"
Set-RegKey $MousePath "MouseHoverTime" "400"
Remove-ItemProperty -Path $MousePath -Name "SmoothMouseXCurve" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $MousePath -Name "SmoothMouseYCurve" -ErrorAction SilentlyContinue

# নেটওয়ার্ক থ্রোটলিং ও সিস্টেম রেসপন্সিভনেস ডিফল্ট করা
$SysProfile = "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile"
Set-RegKey $SysProfile "NetworkThrottlingIndex" 10 -Type DWord
Set-RegKey $SysProfile "SystemResponsiveness" 20 -Type DWord

# MMCSS গেমিং টাস্ক প্রায়োরিটি স্ট্যান্ডার্ড করা
$GameTask = "$SysProfile\\Tasks\\Games"
Set-RegKey $GameTask "GPU Priority" 8 -Type DWord
Set-RegKey $GameTask "Priority" 2 -Type DWord
Set-RegKey $GameTask "Scheduling Category" "Medium"
Set-RegKey $GameTask "SFIO Priority" "Normal"
Set-RegKey $GameTask "Background Only" "True"

# সিপিইউ প্রায়োরিটি সেপারেশন ডি完整 করা (Default Windows Foreground Boost)
Set-RegKey "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl" "Win32PrioritySeparation" 26 -Type DWord

# মনিটর ল্যাটেন্সি ও ডিসপ্লে টিউনিং রিমুভ করা
$DXGPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\DXGKrnl"
Remove-ItemProperty -Path $DXGPath -Name "MonitorLatencyTolerance" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $DXGPath -Name "MonitorRefreshLatencyTolerance" -ErrorAction SilentlyContinue

# VRAM ও জিপিইউ ড্রাইভার থ্রেডিং টিউইক রিমুভ করা
Remove-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000" -Name "PP_MCLKStutterModeThreshold" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" -Name "RmGpsPsEnablePerCpuCoreDpc" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Power" -Name "RmGpsPsEnablePerCpuCoreDpc" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm" -Name "RmGpsPsEnablePerCpuCoreDpc" -ErrorAction SilentlyContinue

# পাওয়ার থ্রোটলিং সায়েন্স ও ফাস্ট বুট রিস্টোর করা
Remove-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerThrottling" -Name "PowerThrottlingOff" -ErrorAction SilentlyContinue
Set-RegKey "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" "HiberbootEnabled" 1 -Type DWord
Set-RegKey "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power" "HibernateEnabledDefault" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\DriverSearching" "SearchOrderConfig" 1 -Type DWord
Set-RegKey "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\54533251-82be-4824-96c1-47b60b740d00\\943c8cb6-6f93-4227-ad87-e9a3feec08d1" "Attributes" 1 -Type DWord

# এক্সবক্স গেম বার এবংDVR সার্ভিস পুনরায় চালু করা
Set-RegKey "HKCU:\\Software\\Microsoft\\GameBar" "ShowStartupPanel" 1 -Type DWord
Set-RegKey "HKCU:\\Software\\Microsoft\\GameBar" "AllowAutoGameMode" 1 -Type DWord
Set-RegKey "HKCU:\\Software\\Microsoft\\GameBar" "AutoGameModeEnabled" 1 -Type DWord
Set-RegKey "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" "AppCaptureEnabled" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" "AllowGameDVR" 1 -Type DWord

$GameStore = "HKCU:\\System\\GameConfigStore"
Set-RegKey $GameStore "GameDVR_Enabled" 1 -Type DWord
Set-RegKey $GameStore "GameDVR_FSEBehaviorMode" 0 -Type DWord
Set-RegKey $GameStore "GameDVR_HonorUserFSEBehaviorMode" 0 -Type DWord
Set-RegKey $GameStore "GameDVR_FSEBehavior" 0 -Type DWord
Set-RegKey $GameStore "GameDVR_DXGIHonorFSEWindowsCompatible" 0 -Type DWord

# উইন্ডোজ এক্সপ্লরার ইন্টারফেস এবং কিল-টাইমআউট ডিফল্ট করা
$DesktopPath = "HKCU:\\Control Panel\\Desktop"
Set-RegKey $DesktopPath "MenuShowDelay" "400"
Set-RegKey $DesktopPath "WaitToKillAppTimeout" "20000"
Set-RegKey $DesktopPath "HungAppTimeout" "5000"
Set-RegKey $DesktopPath "AutoEndTasks" "0"
Set-RegKey "HKLM:\\SYSTEM\\CurrentControlSet\\Control" "WaitToKillServiceTimeout" "5000"

# সুপারফেচ ইভেন্ট লগিং পুনরায় সক্রিয় করা
Set-RegKey "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WINEVT\\Channels\\Microsoft-Windows-Superfetch/Main" "Enabled" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WINEVT\\Channels\\Microsoft-Windows-Superfetch/PfApLog" "Enabled" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WINEVT\\Channels\\Microsoft-Windows-Superfetch/StoreLog" "Enabled" 1 -Type DWord

# ডেটা ট্র্যাকিং এবং টেলিমেট্রি ডিফল্ট করা
Set-RegKey "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" "Enabled" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System" "EnableActivityFeed" 1 -Type DWord
Set-RegKey "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" "DisableWindowsConsumerFeatures" 0 -Type DWord

# ৪. ব্যাকগ্রাউন্ড সার্ভিসসমূহ পুনরায় ডিফল্ট করা (Re-enabling Services to Default State)
Write-Host "[3/5] Restoring background services status..." -ForegroundColor Yellow

$AutoServices = @("WSearch", "Spooler")
$ManualServices = @(
    "SSDPSRV", "lfsvc", "AXInstSV", "AJRouter", "AppReadiness", "SharedAccess",
    "lltdsvc", "diagnosticshub.standardcollector.service", "SmsRouter", "NcdAutoSetup",
    "PNRPsvc", "p2psvc", "p2pimsvc", "PNRPAutoReg", "WalletService", "WMPNetworkSvc",
    "icssvc", "XblAuthManager", "XblGameSave", "XboxNetApiSvc", "DmEnrollmentSvc",
    "RetailDemo", "SDRSVC", "WpcMonSvc", "fax", "wuauserv", "PrintNotify",
    "PrintWorkflowUserSvc"
)

foreach ($Service in $AutoServices) {
    if (Get-Service -Name $Service -ErrorAction SilentlyContinue) {
        Set-Service -Name $Service -StartupType Automatic -ErrorAction SilentlyContinue
        Start-Service -Name $Service -ErrorAction SilentlyContinue
    }
}
foreach ($Service in $ManualServices) {
    if (Get-Service -Name $Service -ErrorAction SilentlyContinue) {
        Set-Service -Name $Service -StartupType Manual -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "[4/5] Windows core logs and diagnostic setups restored." -ForegroundColor Green
Write-Host "[5/5] ALL CHANGES RESTORED TO ORIGINAL WINDOWS DEFAULTS!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Please restart your PC now to complete the rollback." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
`;

    return new Response(powerShellScript, {
      headers: { 
        'content-type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } else {
    // যদি রিকোয়েস্ট ব্রাউজার থেকে আসে, তবে নির্দিষ্ট ইউটিউব লিংকে রিডাইরেক্ট হবে
    const youtubeVideoUrl = 'https://youtu.be/GVizJ_jpUnw?si=lbl9QKs9sX7jcrsp';
    return Response.redirect(youtubeVideoUrl, 302);
  }
}
