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
import RouteForm from './RouteForm';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const AddRoute = () => {
    const [isFormOpen, setFormOpen] = useState(false);

    return (
        <>
            <Button variant="secondary" onClick={() => setFormOpen(true)}>{_("Add Route")}</Button>
            <RouteForm key="new_route" isOpen={isFormOpen} onClose={() => setFormOpen(false)} />
        </>
    );
};

export default AddRoute;
