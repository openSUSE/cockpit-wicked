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
import cockpit from 'cockpit';
import { FormSelect, FormSelectOption, ModalVariant } from '@patternfly/react-core';
import { useNetworkDispatch, addConnection, updateConnection } from '../context/network';
import startModeEnum from '../lib/model/startMode';
import ModalForm from './ModalForm';

const _ = cockpit.gettext;

const startModeOptions = startModeEnum.values.map(mode => {
    return { value: mode, label: startModeEnum.label(mode) };
});

const StartMode = ({ connection }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [startMode, setStartMode] = useState(connection.startMode);
    const dispatch = useNetworkDispatch();

    const closeForm = () => setIsOpen(false);
    const openForm = () => setIsOpen(true);

    const handleSubmit = () => {
        // TODO: notify that something went wrong.
        if (connection.exists) {
            updateConnection(dispatch, connection, { startMode });
        } else {
            addConnection(dispatch, { ...connection, startMode });
        }

        closeForm();
    };

    const renderLink = () => {
        const label = connection.exists ? startModeEnum.label(connection.startMode) : _("Not configured");

        return <a href="#" onClick={openForm}>{label}</a>;
    };

    const renderModalForm = () => {
        if (!isOpen) return;

        return (
            <ModalForm
              caption={connection.name}
              title={_("Start Mode")}
              variant={ModalVariant.small}
              isOpen={isOpen}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            >
                <FormSelect value={startMode} onChange={(_e, val) => setStartMode(val)} id="startMode">
                    {startModeOptions.map((option, index) => (
                        <FormSelectOption key={index} value={option.value} label={option.label} />
                    ))}
                </FormSelect>
            </ModalForm>
        );
    };

    return (
        <>
            { renderLink() }
            { renderModalForm() }
        </>
    );
};

export default StartMode;
