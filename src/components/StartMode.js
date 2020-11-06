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
import { Modal, ModalVariant, Button, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { useNetworkDispatch, updateConnection } from '../context/network';
import startModeEnum from '../lib/model/startMode';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const startModeOptions = startModeEnum.values.map(mode => {
    return { value: mode, label: startModeEnum.label(mode) };
});

const StartMode = ({ connection }) => {
    const [modal, setModal] = useState(false);
    const [startMode, setStartMode] = useState(connection.startMode);
    const dispatch = useNetworkDispatch();

    const closeForm = () => setModal(false);

    const handleSubmit = () => {
        // TODO: notify that something went wrong.
        updateConnection(dispatch, connection, { startMode });
        closeForm();
    };

    const renderModal = () => {
        return (
            <Modal
              variant={ModalVariant.small}
              title={_("Start Mode")}
              isOpen={modal}
              onClose={closeForm}
              actions={[
                  <Button key="confirm" variant="primary" onClick={handleSubmit}>
                      {_("Change")}
                  </Button>,
                  <Button key="cancel" variant="link" onClick={closeForm}>
                      {_("Cancel")}
                  </Button>
              ]}
            >
                <FormSelect value={startMode} onChange={setStartMode} id="startMode">
                    {startModeOptions.map((option, index) => (
                        <FormSelectOption key={index} value={option.value} label={option.label} />
                    ))}
                </FormSelect>
            </Modal>
        );
    };

    return (
        <>
            <a href="#" onClick={() => setModal(true)}>{startModeEnum.label(connection.startMode)}</a>
            { modal && renderModal() }
        </>
    );
};

export default StartMode;
