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
    Page,
    PageSection,
    PageSectionVariants,
    Tab,
    TabTitleText,
    Tabs,
    Title
} from '@patternfly/react-core';
import { NetworkProvider, serviceIsActive } from './context/network';
import StatusBar from './components/StatusBar';
import InactiveServicePage from './components/InactiveServicePage';
import InterfacesTab from './components/InterfacesTab';
import RoutingTab from './components/RoutingTab';

const _ = cockpit.gettext;

export const Application = () => {
    const [checkingService, setCheckingService] = useState(true);
    const [serviceReady, setServiceReady] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState(0);

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

    const renderContent = () => {
        if (checkingService) return null;
        if (serviceReady) return renderTabs();
        return <InactiveServicePage />;
    };

    useEffect(() => {
        serviceIsActive()
                .then(result => {
                    setCheckingService(false);
                    setServiceReady(result);
                });
    }, []);

    return (
        <NetworkProvider>
            <Page>
                { checkingService && <StatusBar showSpinner>{_("Checking if service is active...")}</StatusBar> }

                <PageSection padding={{ default: 'noPadding' }} variant={PageSectionVariants.light}>
                    { renderContent() }
                </PageSection>
            </Page>
        </NetworkProvider>
    );
};
