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

const _ = cockpit.gettext;

const AddressSettingsForm = ({ isOpen, onClose }) => {
    return (
        <Modal
            variant={ModalVariant.small}
            title={_("Address Settings")}
            isOpen={isOpen}
            onClose={() => { console.log("Triggering #onClose"); onClose() }}
            actions={[
                <Button key="confirm" variant="primary" onClick={() => {}}>
                    {_("Apply")}
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    {_("Cancel")}
                </Button>
            ]}
        >

            This is the dialog for editing the address settings.
        </Modal>
    );
};

export default AddressSettingsForm;
