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

import React, { useState } from 'react';
import { Button, Checkbox, Form, FormGroup, Modal, ModalVariant, TextInput } from '@patternfly/react-core';
import cockpit from 'cockpit';
import { useNetworkDispatch, useNetworkState } from '../NetworkContext';

const _ = cockpit.gettext;

const AddBridge = () => {
    const [modal, setModal] = useState(false);
    const [name, setName] = useState("");
    const [selectedInterfaces, setSelectedInterfaces] = useState([]);
    const { interfaces } = useNetworkState();
    const dispatch = useNetworkDispatch();

    const addInterface = () => {
        dispatch({
            type: 'add_interface', payload: { name, type: "br", virtual: true }
        });
        setModal(false);
    };

    const handleSelectedInterfaces = (name) => (value) => {
        if (value) {
            setSelectedInterfaces([...selectedInterfaces, name]);
        } else {
            setSelectedInterfaces(selectedInterfaces.filter(i => i !== name));
        }
    };

    const isComplete = () => {
        return (name === "" || selectedInterfaces.length === 0);
    }

    return (
        <>
            <Button variant="secondary" onClick={() => setModal(true)}>{_("Add Bridge")}</Button>
            <Modal
                variant={ModalVariant.small}
                title={_("Add Bridge")}
                isOpen={modal}
                actions={[
                    <Button key="confirm" variant="primary" onClick={addInterface} isDisabled={isComplete()}>
                        {_("Add")}
                    </Button>,
                    <Button key="cancel" variant="link" onClick={() => setModal(false)}>
                        {_("Cancel")}
                    </Button>
                ]}
            >
                <Form>
                    <FormGroup
                        label={_("Name")}
                        isRequired
                        fieldId="interface-name"
                        helperText={_("Please, provide the interface name (e.g., br0)")}
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
                        {Object.values(interfaces).map(({ name }) => (
                            <Checkbox
                                label={name}
                                key={name}
                                isChecked={selectedInterfaces.includes(name)}
                                onChange={handleSelectedInterfaces(name)}
                            />
                        ))}
                    </FormGroup>
                </Form>
            </Modal>
        </>
    );
};

export default AddBridge;
