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
import { PageSection, Spinner, Split, SplitItem } from '@patternfly/react-core';

/**
 * General component to render an status bar
 *
 * @example
 *
 *  <StatusBar showSpinner>
 *      {_("Doing some checks, please be patient...")}
 *  </StatusBar>
 *
 * @param {object} props - component props
 * @param {boolean} [props.showSpinner=false] - when the status bar should display an small spinner
 * @param {JSX.Element} props.children - content for the status bar
 */
const StatusBar = ({
    showSpinner = false,
    children
}) => {
    return (
        <PageSection className="content-header-extra">
            <Split hasGutter id="state" className="content-header-extra--state">
                { showSpinner && <SplitItem><Spinner size="md" /></SplitItem> }
                <SplitItem isFilled>{children}</SplitItem>
            </Split>
        </PageSection>
    );
};

export default StatusBar;
