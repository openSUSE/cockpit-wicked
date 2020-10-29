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

import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useNetworkState } from '../NetworkContext';
import RoutesDataList from "./RoutesDataList";

const _ = cockpit.gettext;

const AddressSettingsForm = ({ isOpen, onClose }) => {
    const { routes: currentRoutes } = useNetworkState();

    const [routes, setRoutes] = useState(currentRoutes);

    return (
        <Modal
            variant={ModalVariant.small}
            title={_("Address Settings")}
            isOpen={isOpen}
            onClose={() => {
                console.log("Now routes are", routes);
                console.log("Triggering #onClose");

                onClose();
            }}
            actions={[
                <Button key="confirm" variant="primary" onClick={() => {}}>
                    {_("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >

            <RoutesDataList routes={routes} updateRoutes={setRoutes} />
        </Modal>
    );
};

export default AddressSettingsForm;
