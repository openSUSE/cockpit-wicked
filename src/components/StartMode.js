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
import { useNetworkDispatch } from '../NetworkContext';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const START_MODES = {
    auto:    _("At Boot Time"),
    hotplug: _("On Hotplug"),
    ifplugd: _("On Cable Connection"),
    manual:  _("Manually"),
    nfsroot: _("On NFSroot"),
    off:     _("Never")

};

const startModeOptions = Object.keys(START_MODES).map(key => {
    return { value: key, label: START_MODES[key] };
});

const StartMode = ({ connection }) => {
    const [modal, setModal] = useState(false);
    const [startMode, setStartMode] = useState(connection.startMode);
    const dispatch = useNetworkDispatch();

    const updateConnection = () => {
        dispatch({ type: 'update_connection', payload: { id: connection.id, changes: { startMode: startMode } } });
        setModal(false);
    }

    return (
        <>
            <a href="#" onClick={() => setModal(true)}>{START_MODES[connection.startMode]}</a>
            <Modal
                variant={ModalVariant.small}
                title={_("Start Mode")}
                isOpen={modal}
                actions={[
                    <Button key="confirm" variant="primary" onClick={updateConnection}>
                        {_("Change")}
                    </Button>,
                    <Button key="cancel" variant="link" onClick={() => setModal(false)}>
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
        </>
    );
};

export default StartMode;
