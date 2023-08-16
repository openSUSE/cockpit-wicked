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

import React from 'react';
import cockpit from 'cockpit';
import {
    Button,
    EmptyState,
    EmptyStateIcon,
    EmptyStateBody,
    EmptyStateActions,
    EmptyStateHeader
} from '@patternfly/react-core';
import AlertIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

const _ = cockpit.gettext;

/**
 * General component to render an external link using a PF4/Button
 *
 * @example
 *
 *  <ExternalLink href="https://cockpit-project.org">
 *      Cockpit Project Homepage
 *  </ExternalLink>
 *
 * @param {object} props - component props
 * @param {string} props.href - the url to be used as href
 * @param {JSX.Element} props.children - content for the link
 */
const ExternalLink = ({ href, children }) => {
    return (
        <Button component="a" variant="link" target="_blank" href={href}>
            {children}
        </Button>
    );
};

/**
 * Page to be shown when wicked is not active
 */
const InactiveServicePage = () => {
    return (
        <EmptyState>
            <EmptyStateHeader
                titleText={_("Wicked service is not active")}
                headingLevel="h4"
                icon={<EmptyStateIcon icon={AlertIcon} />}
            />
            <EmptyStateBody>
                <p>
                    {_(`Seems that wicked service is not active. It could be either, the service is
                    not running or wicked is not installed.`)}
                </p>
                <p>
                    {_("For more help, please check the documentation linked below.")}
                </p>
            </EmptyStateBody>

            <EmptyStateActions>
                <ExternalLink href="https://en.opensuse.org/Portal:Wicked">
                    openSUSE Wicked Portal
                </ExternalLink>
                <ExternalLink href="https://github.com/openSUSE/wicked/wiki/FAQ">
                    Wicked FAQ
                </ExternalLink>
                <ExternalLink href="https://github.com/openSUSE/wicked">
                    Public Wicked Repository
                </ExternalLink>
            </EmptyStateActions>
        </EmptyState>
    );
};

export default InactiveServicePage;
