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
import {
    EmptyState,
    EmptyStateVariant,
    Page,
    Spinner,
    Tab,
    TabTitleText,
    Tabs,
    Title
} from '@patternfly/react-core';
import { NetworkProvider, serviceIsActive } from './context/network';
import InactiveServicePage from './components/InactiveServicePage';
import InterfacesTab from './components/InterfacesTab';
import RoutingTab from './components/RoutingTab';

const _ = cockpit.gettext;

export const Application = () => {
    const [activeTabKey, setActiveTabKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [serviceActive, setServiceActive] = useState(true);

    const handleTabClick = (event, tabIndex) => {
        setActiveTabKey(tabIndex);
    };

    const renderTabs = () => {
        return (
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab eventKey={0} title={<TabTitleText>{_("Interfaces")}</TabTitleText>}>
                    <InterfacesTab />
                </Tab>
                <Tab eventKey={1} title={<TabTitleText>{_("Routing")}</TabTitleText>}>
                    <RoutingTab />
                </Tab>
            </Tabs>
        );
    };

    useEffect(() => {
        const isActive = async () => {
            const result = await serviceIsActive();
            setLoading(false);
            setServiceActive(result);
        };

        isActive();
    }, []);

    if (loading) return (
        <EmptyState variant={EmptyStateVariant.full}>
            <Spinner />
            <Title headingLevel="h1" size="lg">{_("Loading...")}</Title>
        </EmptyState>
    );

    return (
        <NetworkProvider>
            <Page id="network-configuration">
                {serviceActive ? renderTabs() : <InactiveServicePage />}
            </Page>
        </NetworkProvider>
    );
};
