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

import React, { useState, useEffect, useCallback } from 'react';
import cockpit from 'cockpit';
import {
    FormGroup,
    FormSelect,
    FormSelectOption,
    TextInput,
} from '@patternfly/react-core';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';
import ModalForm from './ModalForm';

const _ = cockpit.gettext;

const VlanForm = ({ isOpen, onClose, connection }) => {
    const { vlan } = connection || {};
    const isEditing = !!connection;
    const [name, setName] = useState(connection?.name);
    const [vlanId, setVlanId] = useState(vlan?.vlanId || 0);
    const [parentDevice, setParentDevice] = useState(vlan?.parentDevice);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();
    const [suggestName, setSuggestName] = useState(!isEditing);

    const proposeName = useCallback(() => {
        if (!suggestName) return;

        setName(`${parentDevice}.${vlanId}`);
    }, [suggestName, parentDevice, vlanId]);

    useEffect(() => {
        setCandidateInterfaces(Object.values(interfaces).filter(i => i.type !== interfaceType.VLAN));
        if (!parentDevice) setParentDevice(Object.values(interfaces)[0]?.name);
    }, [interfaces, parentDevice]);

    useEffect(proposeName, [proposeName]);

    const addOrUpdateConnection = () => {
        if (isEditing) {
            updateConnection(dispatch, connection, { vlan: { name, vlanId, parentDevice } });
        } else {
            addConnection(dispatch, { name, type: interfaceType.VLAN, vlan: { vlanId, parentDevice } });
        }
        onClose();
    };

    const isIncomplete = () => {
        if (name === "") return true;
        if (vlanId === "") return true;
        if (parentDevice === "") return true;

        return false;
    };

    const updateName = (value) => {
        setName(value);
        setSuggestName(false);
    };

    if (!parentDevice) return null;

    return (
        <ModalForm
            caption={connection?.name}
            title={isEditing ? _("Edit VLAN") : _("Add VLAN")}
            isOpen={isOpen}
            onCancel={onClose}
            onSubmit={addOrUpdateConnection}
            onSubmitLabel={isEditing ? _("Change") : _("Add")}
            onSubmitDisable={isIncomplete()}
        >
            <FormGroup
                label={_("Parent")}
                isRequired
                fieldId="parentDevice"
            >

                <FormSelect value={parentDevice} onChange={setParentDevice} id="parentDevice">
                    {candidateInterfaces.map(({ name }) => (
                        <FormSelectOption key={name} value={name} label={name} />
                    ))}
                </FormSelect>
            </FormGroup>

            <FormGroup
                label={_("VLAN ID")}
                isRequired
                fieldId="vlan_id"
                helperText={_("Please, provide the VLAN ID (e.g., 10)")}
            >
                <TextInput
                    isRequired
                    id="vlan_id"
                    value={vlanId}
                    onChange={setVlanId}
                    type="number"
                />
            </FormGroup>

            <FormGroup
                label={_("Name")}
                isRequired
                fieldId="interface-name"
                helperText={_("Please, provide the interface name (e.g., vlan10)")}
            >
                <TextInput
                    isRequired
                    id="interface-name"
                    value={name}
                    onChange={updateName}
                />
            </FormGroup>
        </ModalForm>
    );
};

export default VlanForm;
