# Shelly Pro 3EM Price-Based Boiler Control Script

This script is designed to control a boiler using a Shelly Pro 3EM PRO 3x120A with Switch Add-on based on electricity prices. It automatically turns the boiler on during the cheapest hours of the day, helping to reduce energy costs.

## Hardware Requirements

- Shelly Pro 3EM PRO 3x120A
- Shelly Pro 3EM Switch Add-on
- Compatible firmware versions: 1.0.3 - 1.4.4

## Features

- Automatically controls boiler operation based on electricity prices
- Configurable to run during the cheapest hours of the day
- Backup hours functionality to ensure boiler operation during critical times
- Region-specific price data support
- Daily and monthly scheduling options
- Priority hours configuration

## Configuration

The script is highly configurable through the `SETTINGS_BOILER` object at the beginning of the script:

### Basic Settings

```javascript
let Region = "FI"; // Supported regions: DK1, DK2, EE, FI, LT, LV, NO1, NO2, NO3, NO4, NO5, SE1, SE2, SE3, SE4

let SETTINGS_BOILER = {
    RelayIsInUse: true,  // Activate rule for Relay 1
    Relays: [0], // Relay 1 connected via Switch Add-On (Boiler)
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
};
```

### Configuration Options

- **Region**: Select your electricity market region
- **RelayIsInUse**: Enable/disable the script
- **Relays**: Specify which relay(s) to control (default: Relay 1)
- **RelayName**: Name for identification in logs
- **Inverted**: Invert relay logic if needed
- **RanksAllowed**: Specify which price ranks to allow (1 being cheapest)
- **PriceAlwaysAllowed**: Maximum price in cents to always allow operation
- **MaxPrice**: Maximum price threshold in cents
- **BackupHours**: Hours when the boiler will always run regardless of price
- **AllowedDays**: Days of the week when the script is active (1-7, Monday-Sunday)
- **AllowedMonths**: Months when the script is active (1-12)
- **PriorityHours**: Hours to prioritize (99 means no priority)
- **PriorityHoursRank**: Rank threshold for priority hours
- **PriceModifier**: Price adjustment value

## Installation

1. Access your Shelly Pro 3EM's web interface
2. Navigate to the Scripts section
3. Create a new script
4. Copy and paste the entire script content
5. Save the script
6. Enable the script

## How It Works

The script runs every 30 seconds and:

1. Checks if the current hour has already been processed
2. If not, it makes an HTTP request to the price API
3. Based on the response, it determines if the boiler should be on or off
4. Controls the relay accordingly
5. During backup hours, the boiler will always be on regardless of price

## Troubleshooting

- **Script not running**: Check if `RelayIsInUse` is set to `true`
- **Boiler not turning on**: Verify relay configuration and check logs
- **API errors**: Ensure your region is correctly set and internet connection is stable

## API Information

The script uses the spot-hinta.fi API to fetch electricity price data. The API is region-specific and provides price rankings for different time periods.

## License

This script is provided as-is with no warranty. Use at your own risk.

## Version History

- 2025-04-09: Initial script version 