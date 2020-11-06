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

import React, { useState, useEffect } from 'react';
import {
    Bullseye,
    Button,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    ModalVariant,
    TextInput,
    Spinner
} from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';
import wirelessModes from '../lib/model/wirelessMode';
import wirelessAuthModes from '../lib/model/wirelessAuthMode';
import NetworkClient from '../lib/NetworkClient';

const _ = cockpit.gettext;
const client = new NetworkClient();

const modeOptions = wirelessModes.values.map(mode => {
    return { value: mode, label: wirelessModes.label(mode) };
});
const authModeOptions = wirelessAuthModes.values.map(mode => {
    return { value: mode, label: wirelessAuthModes.label(mode) };
});

const WirelessForm = ({ isOpen, onClose, iface, connection }) => {
    const { wireless } = connection || {};
    const isEditing = !!connection;
    const [essid, setEssid] = useState(connection?.essid);
    const [mode, setMode] = useState(connection?.mode || wirelessModes.MANAGED);
    const [authMode, setAuthMode] = useState(connection?.authMode || wirelessAuthModes.WEP_OPEN);
    const [password, setPassword] = useState(connection?.password || "");
    const [essidList, setEssidList] = useState(essid ? [essid] : []);
    const [scanning, setScanning] = useState(true);
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        refreshList(iface.name);
    }, [iface.name]);

    const refreshList = (name) => {
        client.getEssidList(name)
                .then((result) => {
                    setEssidList([...new Set(result.split("\n"))]);
                    setScanning(false);
                })
                .catch(console.error);
    };

    const addOrUpdateConnection = () => {
        if (isEditing) {
            updateConnection(
                dispatch, connection,
                { wireless: { essid, mode, authMode, password } }
            );
        } else {
            addConnection(
                dispatch, { name: iface.name, type: interfaceType.WIRELESS, wireless: { essid, mode, authMode, password } }
            );
        }
        onClose();
    };

    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit WiFi settings") : _("Add WiFi settings")}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateConnection}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Mode")}
                    isRequired
                    fieldId="wireless-mode"
                >
                    <FormSelect value={mode} onChange={setMode} id="wireless-mode">
                        {modeOptions.map((option, index) => (
                            <FormSelectOption key={index} {...option} />
                        ))}
                    </FormSelect>
                </FormGroup>

                <FormGroup
                    label={_("ESSID")}
                    isRequired
                    fieldId="essid"
                >
                    { scanning
                        ? <Bullseye><Spinner size="lg" /></Bullseye>
                        : <FormSelect value={essid} onChange={setEssid} id="essid">
                            {essidList.map((option, index) => (
                                <FormSelectOption key={option} value={option} label={option} />
                            ))}
                        </FormSelect> }
                </FormGroup>
                <FormGroup
                    label={_("AUTH Mode")}
                    isRequired
                    fieldId="wireless-auth-mode"
                >
                    <FormSelect value={authMode} onChange={setAuthMode} id="wireless-auth-mode">
                        {authModeOptions.map((option, index) => (
                            <FormSelectOption key={index} {...option} />
                        ))}
                    </FormSelect>
                </FormGroup>
                { (authMode === "psk") &&
                    <FormGroup
                        label={_("Password")}
                        isRequired
                        fieldId="password"
                    >
                        <TextInput
                            isRequired
                            id="password"
                            value={password}
                            onChange={setPassword}
                            type='password'
                        />
                    </FormGroup>}
            </Form>
        </Modal>
    );
};

export default WirelessForm;
