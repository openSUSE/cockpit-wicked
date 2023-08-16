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
import cockpit from 'cockpit';
import {
    Checkbox,
    FormGroup,
    FormSelect,
    FormSelectOption,
    HelperText,
    HelperTextItem,
    TextInput
} from '@patternfly/react-core';
import { useNetworkDispatch, useNetworkState, addConnection, updateConnection } from '../context/network';
import interfaceType from '../lib/model/interfaceType';
import bondingModes from '../lib/model/bondingMode';
import ModalForm from './ModalForm';

const _ = cockpit.gettext;

const modeOptions = bondingModes.values.map(mode => {
    return { value: mode, label: bondingModes.label(mode) };
});

const BondForm = ({ isOpen, onClose, connection }) => {
    const { bond } = connection || {};
    const isEditing = !!connection;
    const [name, setName] = useState(connection?.name || "");
    const [mode, setMode] = useState(bond?.mode || bondingModes.ACTIVE_BACKUP);
    const [options, setOptions] = useState(bond?.options || "miimon=100");
    const [selectedInterfaces, setSelectedInterfaces] = useState(bond?.interfaces || []);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        if (isEditing) {
            setCandidateInterfaces(Object.values(interfaces).filter(i => i.name !== connection.name));
        } else {
            setCandidateInterfaces(Object.values(interfaces));
        }
    }, [connection, isEditing, interfaces]);

    const addOrUpdateConnection = () => {
        const bondingAttrs = {
            name,
            bond: {
                mode,
                interfaces: selectedInterfaces,
                options
            }
        };

        if (isEditing) {
            updateConnection(dispatch, connection, bondingAttrs);
        } else {
            addConnection(dispatch, { ...bondingAttrs, type: interfaceType.BONDING });
        }
        onClose();
    };

    const handleSelectedInterfaces = (name) => (value) => {
        if (value) {
            setSelectedInterfaces([...selectedInterfaces, name]);
        } else {
            setSelectedInterfaces(selectedInterfaces.filter(i => i !== name));
        }
    };

    const isIncomplete = () => {
        return (name === "" || selectedInterfaces.length === 0);
    };

    return (
        <ModalForm
            caption={connection?.name}
            title={isEditing ? _("Edit Bond") : _("Add Bond")}
            isOpen={isOpen}
            onCancel={onClose}
            onSubmit={addOrUpdateConnection}
            onSubmitDisable={isIncomplete()}
            onSubmitLabel={isEditing ? _("Change") : _("Add")}
        >
            <FormGroup
                label={_("Name")}
                isRequired
                fieldId="interface-name"
                helperText={_("Please, provide the interface name (e.g., bond0)")}
            >
                <TextInput
                    isRequired
                    isDisabled={isEditing}
                    id="interface-name"
                    value={name}
                    onChange={(_e, val) => setName(val)}
                />
                <HelperText>
                    <HelperTextItem>
                        {_("Please, provide the interface name (e.g., bond0)")}
                    </HelperTextItem>
                </HelperText>
            </FormGroup>

            <FormGroup
                label={_("Interfaces")}
                isRequired
            >
                {candidateInterfaces.map(({ name }) => (
                    <Checkbox
                        label={name}
                        key={name}
                        isChecked={selectedInterfaces.includes(name)}
                        onChange={(_e, val) => handleSelectedInterfaces(name)(val)}
                    />
                ))}
            </FormGroup>

            <FormGroup
                label={_("Mode")}
                isRequired
                fieldId="bonding-mode"
            >
                <FormSelect value={mode} onChange={(_e, val) => setMode(val)} id="bonding-mode">
                    {modeOptions.map((option, index) => (
                        <FormSelectOption key={index} {...option} />
                    ))}
                </FormSelect>
            </FormGroup>

            <FormGroup
                label={_("Options")}
                fieldId="bond-options"

            >
                <TextInput
                    isRequired
                    id="bond-options"
                    value={options}
                    onChange={(_e, val) => setOptions(val)}
                />
                <HelperText>
                    <HelperTextItem>
                        {_("Use this field to provide more options using the key=value format")}
                    </HelperTextItem>
                </HelperText>
            </FormGroup>
        </ModalForm>
    );
};

export default BondForm;
