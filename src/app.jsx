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
import InterfacesTab from './components/InterfacesTab';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { NetworkProvider } from './NetworkContext';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

export const Application = () => {
    const [activeTabKey, setActiveTabKey] = useState(0);

    const handleTabClick = (event, tabIndex) => {
        setActiveTabKey(tabIndex);
    };

    return (
        <NetworkProvider>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab eventKey={0} title={<TabTitleText>{_("Interfaces")}</TabTitleText>}>
                    <InterfacesTab />
                </Tab>
            </Tabs>
        </NetworkProvider>
    );
};
