# Network Troubleshooting Guide

## Why Your IP Address Changes

Your computer uses **DHCP (Dynamic Host Configuration Protocol)**, which means:
- The router automatically assigns an IP address when you connect
- The IP can be different each time you connect
- The IP depends on which router/network you connect to

## Current Situation

- **Your Computer**: `10.208.80.78` (DHCP from router `10.208.80.31`)
- **ESP32**: `10.244.230.50` (static IP, connected to "Pi(10)" WiFi)

These are on **different networks**, so they can't communicate.

## Solutions

### Solution 1: Connect to the Correct WiFi Network

1. **Check which WiFi you're connected to:**
   - Look at your WiFi icon in the system tray
   - It should say "Pi(10)"

2. **If you're on a different network:**
   - Disconnect from current WiFi
   - Connect to "Pi(10)" WiFi
   - Wait for connection
   - Run `ipconfig` - your IP should be in `10.244.230.x` range

3. **If multiple routers have the same name "Pi(10)":**
   - Make sure both your computer and ESP32 connect to the **same physical router**
   - Check router admin panel to see connected devices

### Solution 2: Set Static IP on Your Computer (Advanced)

If you want your computer to always have the same IP:

1. **Open Network Settings:**
   - Right-click WiFi icon → "Open Network & Internet settings"
   - Click "Change adapter options"
   - Right-click "Wi-Fi" → Properties
   - Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties

2. **Set Static IP:**
   - Select "Use the following IP address"
   - IP address: `10.244.230.100` (or any free IP in that range)
   - Subnet mask: `255.255.255.0`
   - Default gateway: `10.244.230.84` (same as ESP32)
   - DNS: `8.8.8.8` (or your router's DNS)

3. **Save and reconnect**

### Solution 3: Check Router Settings

1. **Access router admin panel** (usually `http://10.244.230.84` or `http://10.244.230.1`)
2. **Check DHCP range** - make sure it includes `10.244.230.x`
3. **Disable AP Isolation** if enabled (prevents devices from communicating)
4. **Check connected devices** - verify both your computer and ESP32 are listed

## Quick Test Commands

```cmd
# Check your current IP
ipconfig

# Test connectivity to ESP32
ping 10.244.230.50

# Test HTTP connection
curl http://10.244.230.50/test
```

## Why This Happens

- **Different Routers**: Multiple routers can have the same SSID "Pi(10)" but different IP ranges
- **DHCP Pool**: Router assigns IPs from its configured range
- **Network Switching**: Windows may auto-connect to a different network with the same name

## Best Practice

For IoT projects, it's better to:
1. Use **static IPs** for devices (like your ESP32)
2. Keep devices on the **same physical network**
3. Use a **dedicated IoT network** if possible

