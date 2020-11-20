/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import cockpit from "cockpit";
import React from 'react';
import StartMode from './StartMode';
import BridgeDetails from './BridgeDetails';
import BondDetails from './BondDetails';
import VlanDetails from './VlanDetails';
import WirelessDetails from './WirelessDetails';
import IPSettingsLink from './IPSettingsLink';
import DeleteConnection from './DeleteConnection';
import interfaceTypeEnum from '../lib/model/interfaceType';
import { Alert, Split, SplitItem, Switch, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

const _ = cockpit.gettext;

const startMode = (connection) => {
    return (
        <>
            <dt>{_("Start")}</dt>
            <dd><StartMode connection={connection} /></dd>
        </>
    );
};

const macAddress = (iface) => {
    return (
        <>
            <dt>{_("MAC")}</dt>
            <dd>{iface.mac}</dd>
        </>
    );
};

const bondDetails = (connection) => {
    return (
        <>
            <dt>{_("Bond")}</dt>
            <dd><BondDetails connection={connection} /></dd>
        </>
    );
};

const bridgeDetails = (connection) => {
    return (
        <>
            <dt>{_("Bridge")}</dt>
            <dd><BridgeDetails connection={connection} /></dd>
        </>
    );
};

const vlanDetails = (connection) => {
    return (
        <>
            <dt>{_("VLAN")}</dt>
            <dd><VlanDetails connection={connection} /></dd>
        </>
    );
};

const wirelessDetails = (iface, connection) => {
    return (
        <>
            <dt>{_("WiFi")}</dt>
            <dd><WirelessDetails iface={iface} connection={connection} /></dd>
        </>
    );
};

const ipV4Details = (connection) => {
    return (
        <>
            <dt>{_("IPv4 settings")}</dt>
            <dd><IPSettingsLink connection={connection} /></dd>
        </>
    );
};

const ipV6Details = (connection) => {
    return (
        <>
            <dt>{_("IPv6 settings")}</dt>
            <dd><IPSettingsLink connection={connection} ipVersion='ipv6' /></dd>
        </>
    );
};

const renderError = (error) => {
    if (!error) return;

    return <Alert variant="warning" isInline title={error} />;
};

const InterfaceDetails = ({ iface, connection, changeConnectionState, deleteConnection }) => {
    const renderFullDetails = () => {
        if (connection.exists) {
            return (
                <>
                    { iface.type === interfaceTypeEnum.BONDING && bondDetails(connection) }
                    { iface.type === interfaceTypeEnum.BRIDGE && bridgeDetails(connection) }
                    { iface.type === interfaceTypeEnum.VLAN && vlanDetails(connection) }
                    { iface.type === interfaceTypeEnum.WIRELESS && wirelessDetails(iface, connection) }
                    { ipV4Details(connection) }
                    { ipV6Details(connection) }
                </>
            );
        }
    };

    const renderActions = () => {
        if (!connection.exists) return;

        return (
            <Toolbar>
                <ToolbarContent>
                    <ToolbarItem>
                        <DeleteConnection connection={connection} deleteConnection={deleteConnection} />
                    </ToolbarItem>

                    {
                        iface &&
                        <ToolbarItem>
                            <Switch
                              id={`status_${iface.name}}`}
                              isChecked={iface.link}
                              onChange={() => changeConnectionState(connection, !iface.link)}
                            />
                        </ToolbarItem>
                    }
                </ToolbarContent>
            </Toolbar>
        );
    };

    return (
        <>
            {renderError(iface.error)}

            <Split hasGutter>
                <SplitItem isFilled>
                    <dl className="details-list">
                        { iface.mac && macAddress(iface) }
                        {startMode(connection)}
                        {renderFullDetails()}
                    </dl>
                </SplitItem>
                <SplitItem>
                    { renderActions() }
                </SplitItem>
            </Split>
        </>
    );
};

export default InterfaceDetails;
