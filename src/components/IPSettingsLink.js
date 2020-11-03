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
import { Button } from '@patternfly/react-core';
import IPSettingsForm from './IPSettingsForm';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const IPSettingsLink = ({ ipVersion = 'ipv4', connection }) => {
    const [isFormOpen, setFormOpen] = useState(false);

    const renderLinkText = () => {
        return connection[ipVersion].bootProto || _("Not configured");
    };

    const renderForm = () => {
        if (!isFormOpen) return null;

        return (
            <IPSettingsForm
              ipVersion={ipVersion}
              connection={connection}
              isOpen={isFormOpen}
              onClose={() => setFormOpen(false)}
            />
        );
    };

    return (
        <>
            <Button variant="link" onClick={() => setFormOpen(true)}>{renderLinkText()}</Button>
            {renderForm()}
        </>
    );
};

export default IPSettingsLink;
