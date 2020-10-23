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
    Checkbox,
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
import bondingModes from '../lib/model/bondingMode';

const _ = cockpit.gettext;

const bondingModeOptions = bondingModes.values.map(mode => {
    return { value: mode, label: bondingModes.label(mode) };
});

/**
 * Returns given options string as an object
 *
 * @param {string} options - options in a key=value format, separated by space
 * @return {object} an object holding given options
 */
const parseOptions = (options) => {
    return options.split(" ").reduce((obj, option) => {
        if (option) {
            const [key, value] = option.split("=");
            obj[key] = value;
        }

        return obj;
    }, {});
};

/**
 * Returns given options object serialized as a key=value string
 *
 * @param {object} options - options object
 * @return {string} a key=value string
 */
const serializeOptions = (options) => (
    Object.keys(options).map((key) => `${key}=${options[key]}`)
            .join(" ")
);

const BondForm = ({ isOpen, onClose, bond }) => {
    const isEditing = !!bond;
    const [name, setName] = useState(bond?.name || "");
    const [bondingMode, setBondingMode] = useState(bond?.bondingMode || bondingModes.ACTIVE_BACKUP);
    const [options, setOptions] = useState(bond?.options || "");
    const [selectedInterfaces, setSelectedInterfaces] = useState(bond?.interfaces || []);
    const [candidateInterfaces, setCandidateInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        if (isEditing) {
            setCandidateInterfaces(Object.values(interfaces).filter(i => i.id !== bond.id));
        } else {
            setCandidateInterfaces(Object.values(interfaces));
        }
    }, [interfaces]);

    const addConnection = () => {
        const { mode, ...rest } = parseOptions(options);

        dispatch({
            type: actionTypes.ADD_CONNECTION,
            payload: {
                name,
                interfaces: selectedInterfaces,
                type: interfaceType.BONDING,
                // TODO: re-evaluate if we actually want this
                bondingMode: parseInt(mode) || bondingMode,
                options: serializeOptions(rest)
            }
        });
    };

    const updateConnection = () => {
        const { mode, ...rest } = parseOptions(options);

        dispatch({
            type: actionTypes.UPDATE_CONNECTION,
            payload: {
                id: bond.id,
                changes: {
                    name,
                    bondingMode: parseInt(mode) || bondingMode,
                    interfaces: selectedInterfaces,
                    options: serializeOptions(rest)
                }
            }
        });
    };

    const addOrUpdateConnection = () => {
        if (isEditing) {
            updateConnection();
        } else {
            addConnection();
        }
        closeForm();
    };

    const closeForm = () => {
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
        <Modal
            variant={ModalVariant.small}
            title={isEditing ? _("Edit Bond") : _("Add Bond")}
            isOpen={isOpen}
            onClose={closeForm}
            actions={[
                <Button key="confirm" variant="primary" onClick={addOrUpdateConnection} isDisabled={isIncomplete()}>
                    {isEditing ? _("Change") : _("Add")}
                </Button>,
                <Button key="cancel" variant="link" onClick={closeForm}>
                    {_("Cancel")}
                </Button>
            ]}
        >
            <Form>
                <FormGroup
                    label={_("Name")}
                    isRequired
                    fieldId="interface-name"
                    helperText={_("Please, provide the interface name (e.g., bond0)")}
                >
                    <TextInput
                        isRequired
                        id="interface-name"
                        value={name}
                        onChange={setName}
                    />
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
                            onChange={handleSelectedInterfaces(name)}
                        />
                    ))}
                </FormGroup>

                <FormGroup
                    label={_("Mode")}
                    isRequired
                    fieldId="bonding-mode"
                >
                    <FormSelect value={bondingMode} onChange={setBondingMode} id="bonding-mode">
                        {bondingModeOptions.map((option, index) => (
                            <FormSelectOption key={index} {...option} />
                        ))}
                    </FormSelect>
                </FormGroup>

                <FormGroup
                    label={_("Options")}
                    fieldId="bond-options"
                    helperText={_("Use this field to provide more options using the key=value format")}
                >
                    <TextInput
                        isRequired
                        id="bond-options"
                        value={options}
                        onChange={setOptions}
                    />
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default BondForm;
