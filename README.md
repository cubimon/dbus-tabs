# Tabs dbus

read opened/activated browser tabs from dbus and focus or rename them.
WARNING:
In case you don't know dbus, it is a desktop bus interface for applications to communicate with each other.
If you don't know dbus you probably don't want this plugin.

## Installation

- install the addon in your browser
- set the path to `dbus_tabs_native_service.py` in `dbus_tabs.json`
- run `install_native.sh` or copy the `dbus_tabs.json` manually to `~/.mozilla/native-messaging-hosts/`

## Building

Run `yarn build`, this extension uses the Mozillas web-ext plugin to build.

## Use case

To use this extension you have to write your own program/script to access dbus.
`dbus_test.py` is a python example which can be modify and bound to some key in order to find a tab from dmenu, bash or wherever you want.

## Motivation

This extension is very similar to KDE's Plasma Browser Integration, which also provides a dbus interface to get and activate tabs.
In contrast this plugin provides an additional dbus functions to rename tabs but contains way less functionality overall.
E.g. Plasma Browser Integration has MPRIS integration.

