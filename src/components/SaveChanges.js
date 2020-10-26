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
import { Button } from '@patternfly/react-core';
import cockpit from "cockpit";
import { useNetworkDispatch, useNetworkState, actionTypes } from '../NetworkContext';
import { NetworkClient } from '../lib/network';

const _ = cockpit.gettext;
const client = new NetworkClient();

const SaveChanges = () => {
    const [status, setStatus] = useState('disabled');
    const { connections, routes } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        const modified_connections = Object.values(connections).find(c => c.modified);
        const modified_routes = Object.values(routes).find(c => c.modified);

        setStatus((modified_connections || modified_routes) ? 'enabled' : 'disabled');
    }, [connections, routes]);

    const applyChanges = () => {
        setStatus('loading');

        if (Object.values(routes).find(c => c.modified))
            client.updateRoutes(Object.values(routes))
                    .then(result => dispatch(
                        { type: actionTypes.SET_ROUTES, payload: result }));

        if (Object.values(connections).find(c => c.modified))
            client.updateConnections(Object.values(connections))
                    .then(result => dispatch(
                        { type: actionTypes.SET_CONNECTIONS, payload: result }));
    };

    return (
        <Button
            isLoading={ status === 'loading' }
            isDisabled={ status === 'disabled' }
            variant="primary" onClick={applyChanges}
        >
            {_("Save Changes")}
        </Button>
    );
};

export default SaveChanges;
