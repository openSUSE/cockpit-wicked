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
import ConnectionSettingsForm from './ConnectionSettingsForm';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const ConnectionSettingsLink = ({ connection }) => {
    const [isFormOpen, setFormOpen] = useState(false);

    const renderLinkText = () => {
        if (!connection) return _("Not configured");
        if (connection.bootProto !== "static") return connection.bootProto;

        return connection.iP;
    };

    return (
        <>
            <Button variant="link" onClick={() => setFormOpen(true)}>{renderLinkText()}</Button>
            { isFormOpen && <ConnectionSettingsForm connection={connection} isOpen={isFormOpen} onClose={() => setFormOpen(false)} /> }
        </>
    );
};

export default ConnectionSettingsLink;