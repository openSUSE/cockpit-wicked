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

import cockpit from "cockpit";
import React, { useState } from 'react';
import DnsSettingsForm from './DnsSettingsForm';

const _ = cockpit.gettext;

const PolicyDetails = ({ onClick, dns }) => {
    const { policy } = dns;

    return (
        <>
            <dt>{_("Policy")}</dt>
            <dd><a href="#" onClick={onClick}>{policy}</a></dd>
        </>
    );
};

const SearchListDetails = ({ onClick, dns }) => {
    const { searchList } = dns;

    return (
        <>
            <dt>{_("SearchList")}</dt>
            <dd><a href="#" onClick={onClick}>{searchList.join(" ")}</a></dd>
        </>
    );
};

const NameServersDetails = ({ onClick, dns }) => {
    const { nameServers } = dns;

    return (
        <>
            <dt>{_("NameServers")}</dt>
            <dd><a href="#" onClick={onClick}>{nameServers.join(" ")}</a></dd>
        </>
    );
};

const DnsSettings = ({ dns }) => {
    const [isFormOpen, setFormOpen] = useState(false);

    const openForm = () => setFormOpen(true);
    const closeForm = () => setFormOpen(false);

    return (
        <dl className="details-list">

            { dns &&
                <>
                    <PolicyDetails dns={dns} onClick={openForm} />
                    <SearchListDetails dns={dns} onClick={openForm} />
                    <NameServersDetails dns={dns} onClick={openForm} />
                    { isFormOpen && <DnsSettingsForm isOpen={isFormOpen} onClose={closeForm} dns={dns} /> }
                </> }
        </dl>
    );
};

export default DnsSettings;
