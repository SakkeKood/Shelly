// Supported Shelly firmwares: 1.0.3 - 1.4.4. Script version: 2025-04-09

// Region to use
let Region = "FI"; // Supported regions: DK1, DK2, EE, FI, LT, LV, NO1, NO2, NO3, NO4, NO5, SE1, SE2, SE3, SE4

// Boiler relay control settings (using Switch Add-On)
let SETTINGS_BOILER = {
    RelayIsInUse: true,  // Activate rule for Relay 1
    RelaysId: [100], // Relay 100 connected via Switch Add-On (Boiler)
    RelayName: "Boiler",  // Name for this relay/rule
    Inverted: false, // Inverted relay logic (change if required)
    
    // Define allowed ranks (the 3 cheapest hours between 22:00-07:00)
    RanksAllowed: "1,2,3,4,5", // Cheapest 3 hours
    PriceAlwaysAllowed: "0", // Allowed price in euro cents
    MaxPrice: "999", // Maximum allowed price (in cents)
    
    // Backup hours: during these hours, the relay stays ON regardless of price
    BackupHours: [4, 5, 6], // 4 AM, 5 AM, 6 AM
    
    // Other settings
    AllowedDays: "1,2,3,4,5,6,7", // Active every day
    AllowedMonths: "1,2,3,4,5,6,7,8,9,10,11,12", // Active all months
    PriorityHours: "99", // Do not prioritize any hours
    PriorityHoursRank: "3", // Rank for priority hours
    PriceModifier: "0", // No price modification

    // Script technical fields
    SettingsNumber: 1, RelayStatus: true, InvertedOn: true, InvertedOff: false, RelayExecuted: false, Url: "", IsFirstRound: true
};

// Script starts here - Do not edit anything below
print("Boiler Control: Script is starting...");
if (SETTINGS_BOILER.RelayIsInUse === false) { 
    print("Boiler Control: Relay rule is disabled, script does nothing!"); 
    return;
}

let currentHour = -1; 

Timer.set(30000, true, function () {
    let newHour;
    try {
        newHour = new Date().getHours();
    } catch (e) {
        print("Boiler Control: Error getting current time. Turning relay ON as a failsafe.");
        SetRelayStatusInShelly(SETTINGS_BOILER, SETTINGS_BOILER.InvertedOn);
        SETTINGS_BOILER.RelayExecuted = true;
        return;
    }
    
    if (currentHour !== newHour) {
        currentHour = newHour;
        if (SETTINGS_BOILER.RelayIsInUse === true) { SETTINGS_BOILER.RelayExecuted = false } else { SETTINGS_BOILER.RelayExecuted = true; };
    }

    if (SETTINGS_BOILER.RelayExecuted === true) { 
        print("Boiler Control: Current hour is already done.");
        return; 
    }
    ExecuteRelayRule(SETTINGS_BOILER);
});

function ExecuteRelayRule(Settings) {
    if (Settings.RelayIsInUse === false || Settings.RelayExecuted === true) { return; }
    print("Boiler Control: running rule for relay: " + Settings.RelayName);
    Shelly.call("HTTP.Request", { method: "GET", url: Settings.Url, timeout: 10, ssl_ca: "*" }, ProcessHttpRequestResponse, Settings);
}

function ProcessHttpRequestResponse(response, error_code, error_msg, Settings) {
    let relayExecuted = SetRelayStatusInShellyBasedOnHttpStatus(response, error_code, error_msg, Settings);
    SETTINGS_BOILER.RelayExecuted = relayExecuted;
}

function SetRelayStatusInShellyBasedOnHttpStatus(response, error_code, error_msg, Settings) {
    if (error_code === 0 && response !== null) {
        if (response.code === 200) { 
            SetRelayStatusInShelly(Settings, Settings.InvertedOn); 
            return true; 
        }
        if (response.code === 400) { 
            SetRelayStatusInShelly(Settings, Settings.InvertedOff); 
            return true; 
        }
    }
    if (Settings.BackupHours.indexOf(currentHour) > -1) { 
        SetRelayStatusInShelly(Settings, Settings.InvertedOn); 
        return false; 
    } else { 
        SetRelayStatusInShelly(Settings, Settings.InvertedOff); 
        return false; 
    }
}

function SetRelayStatusInShelly(Settings, newStatus) {
    if (Settings.RelayStatus === newStatus && Settings.IsFirstRound === false) { 
        print("Boiler Control: No action is done. The relay status remains the same as during previous execution.");
        return; 
    }

    for (let i = 0; i < Settings.RelaysId.length; i++) {
        print("Boiler Control: Changing relay status. Id: " + Settings.RelaysId[i] + " - New relay status: " + newStatus);
        Shelly.call("Switch.Set", { id: Settings.RelaysId[i], on: newStatus }, null, null);
    }

    SETTINGS_BOILER.RelayStatus = newStatus; 
    SETTINGS_BOILER.IsFirstRound = false;
}

function BuildUrl(Settings) {
    let url = "https://api.spot-hinta.fi/JustNowRanksAndPrice";
    url += "?ranksAllowed=" + Settings.RanksAllowed;
    url += "&priceAlwaysAllowed=" + Settings.PriceAlwaysAllowed;
    url += "&maxPrice=" + Settings.MaxPrice;
    url += "&allowedDays=" + Settings.AllowedDays;
    url += "&allowedMonths=" + Settings.AllowedMonths;
    url += "&boosterHours=" + Settings.BoosterHours;
    url += "&priorityHours=" + Settings.PriorityHours;
    url += "&priorityHoursRank=" + Settings.PriorityHoursRank;
    url += "&priceModifier=" + Settings.PriceModifier;
    url += "&region=" + Region;
    return url;
}

SETTINGS_BOILER.Url = BuildUrl(SETTINGS_BOILER);

if (SETTINGS_BOILER.Inverted === true) { 
    SETTINGS_BOILER.InvertedOn = false; 
    SETTINGS_BOILER.InvertedOff = true; 
}
