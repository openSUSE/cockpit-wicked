# Cockpit Wicked

[Cockpit](https://cockpit-project.org/) user interface for
[wicked](https://github.com/openSUSE/wicked).

![Interfaces List Screenshot](/screenshot.png?raw=true "Interfaces List Screenshot")

## Current Status

Although it is in a very early stage of development, it already supports a set
of basic uses cases:

- Browse interfaces and configurations.
- Configure basic IPv4/IPv6 settings.
- Set up wireless devices (only WEP and WPA-PSK are supported by now).
- Set up bridges, bond and VLAN devices.
- Manage routes (work in progress).

However, many features are still missing:

- Complete support for wireless devices.
- Support for advanced devices, like TUN/TAP or Infiniband.
- Handle IP forwarding settings.
- Rename devices.
- (Much) better error handling.
- Other goodies like displaying Wicked's logs or device statistics, as the
  NetworkManager module already does.

## Architecture

At this point, Wicked does not offer a D-Bus interface to query or configure the
network. However, it features an XML-based nice command-line interface (CLI) and
it uses the files under `/etc/sysconfig/network` as configuration sources.

Thus, this module works as follows:

* Reads the network configuration using Wicked's CLI (`show-xml` and
  `show-config` commands).
* Writes the updated configuration to `/etc/sysconfig/network` and asks Wicked
  to load it through the `ifreload` command.
* Listens for events on Wicked's D-Bus interface.

## Acknowledgments

* This module is based on the awesome [Cockpit Starter
Kit](https://github.com/cockpit-project/starter-kit).
