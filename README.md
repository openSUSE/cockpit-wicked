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
- Set up bridges, bonding and VLAN devices (experimental).
- Manage routes (work in progress).
- Set basic DNS settings (policy, static name servers and search list).

However, many features are still missing:

- Complete support for wireless devices.
- Support for advanced devices, like TUN/TAP or Infiniband.
- Handle IP forwarding configuration.
- Devices renaming.
- Other goodies like displaying Wicked's logs or device statistics, as the
  NetworkManager module already does.
  
# Installing

`make install` compiles and installs the package in `/usr/share/cockpit/`. The
convenience targets `srpm` and `rpm` build the source and binary rpms,
respectively. Both of these make use of the `dist-gzip` target, which is used
to generate the distribution tarball. In `production` mode, source files are
automatically minified and compressed. Set `NODE_ENV=production` if you want to
duplicate this behavior.

For development, you usually want to run your module straight out of the git
tree. To do that, link that to the location were `cockpit-bridge` looks for packages:

```
make devel-install
```

After changing the code and running `make` again, reload the Cockpit page in
your browser.

You can also use
[watch mode](https://webpack.js.org/guides/development/#using-watch-mode) to
automatically update the webpack on every code change with

```
npm run watch
```
or
```
make watch
```

## Developing

If you are interested in contributing to the development, you might be
interested in checking the [DEVELOPMENT.md file](./DEVELOPMENT.md). It contains
some interesting information about the module is organized.

## Acknowledgments

* This module is based on the awesome [Cockpit Starter
Kit](https://github.com/cockpit-project/starter-kit).
