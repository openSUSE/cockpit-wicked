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
    Button,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Modal,
    ModalVariant,
    TextInput
} from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState, actionTypes } from '../NetworkContext';
import interfaceType from '../lib/model/interfaceType';

const _ = cockpit.gettext;

const VlanForm = ({ isOpen, onClose, conn }) => {
    const isEditing = !!conn;
    const [name, setName] = useState(conn?.name);
    const [vlanId, setVlanId] = useState(conn?.vlanId || 0);
    const [parentDevice, setParentDevice] = useState(conn?.parentDevice);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();
    const [suggestName, setSuggestName] = useState(!isEditing);

    useEffect(() => {
        setCandidateInterfaces([...Object.values(interfaces)]);
    }, [interfaces]);


    const addOrUpdateConnection = () => {
        if (isEditing) {
            updateConnection();
        } else {
            addConnection();
        }
        onClose();
    };

    const addConnection = () => {
        dispatch({
            type: actionTypes.ADD_CONNECTION,
            payload: {
                name,
                parentDevice,
                vlanId,
                type: interfaceType.VLAN
            }
        });
    };

    const updateConnection = () => {
        dispatch({
            type: actionTypes.UPDATE_CONNECTION,
            payload: {
                id: conn.id,
                changes: {
                    name,
                    parentDevice,
                    vlanId
                }
            }
        });
    };

    const isIncomplete = () => {
        if (name === "") return true;
        if (vlanId === "") return true;
        if (parentDevice === "") return true;

        return false;
    };

  const updateName = (value) => {
        setName(value)
        setSuggestName(false);
    };

    const proposeName = () => {
        if (!suggestName) return;
        setName(`${parentDevice}.${vlanId}`);
    };

    const updateParent = (value) => {
        setParentDevice(value);
        proposeName();
    };

    const updateVlanId = (value) => {
        setVlanId(value);
        proposeName();
    };


    return (
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit VLAN") : _("Add VLAN")}
            isOpen={isOpen}
            onClose={onClose}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateConnection} isDisabled={isIncomplete()}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Parent")}
                    isRequired
                    fieldId="parentDevice"
                >
                  <FormSelect value={parentDevice} onChange={(value) => updateParent(value)} id="parentDevice">
                        {candidateInterfaces.map(({ name }, index) => (
                            <FormSelectOption key={index} value={name} label={name} />
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
                        defaultValue={vlanId}
                        onChange={(value) => updateVlanId(value)}
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
                        devaultValue={name}
                        onChange={updateName}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default VlanForm;
