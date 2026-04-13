use std::process::Command;

pub fn run_ps(script: &str) -> Result<String, String> {
    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-NonInteractive", "-Command", script])
        .output()
        .map_err(|e| format!("Failed to run PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        // PowerShell often writes non-fatal errors to stderr; only fail if stdout is empty
        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.trim().is_empty() {
            return Err(format!("PowerShell error: {}", stderr));
        }
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

pub fn run_ps_elevated(script: &str) -> Result<String, String> {
    let escaped = script.replace('\"', "\\\"").replace('\'', "''");
    let wrapper = format!(
        "Start-Process powershell.exe -Verb RunAs -Wait -ArgumentList '-NoProfile -NonInteractive -Command \"{}\"'",
        escaped
    );

    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-NonInteractive", "-Command", &wrapper])
        .output()
        .map_err(|e| format!("Failed to launch elevated PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.trim().is_empty() {
            return Err(format!("Elevated PowerShell error: {}", stderr));
        }
    }

    Ok("done".to_string())
}
