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
import cockpit from 'cockpit';
import {
    FormGroup,
    TextInput
} from '@patternfly/react-core';
import { useNetworkDispatch, updateDnsSettings } from '../context/network';
import ModalForm from './ModalForm';
import IPInput from './IPInput';

const _ = cockpit.gettext;

const DnsSettingsForm = ({ isOpen, onClose, dns }) => {
    const dispatch = useNetworkDispatch();
    const originalNameServers = (dns?.nameServers || "").split(" ");
    const [nameserver1, setNameserver1] = useState(originalNameServers[0] || "");
    const [nameserver2, setNameserver2] = useState(originalNameServers[1] || "");
    const [nameserver3, setNameserver3] = useState(originalNameServers[2] || "");
    const [policy, setPolicy] = useState(dns?.policy || "");
    const [searchList, setSearchList] = useState(dns?.searchList || "");

    const nameServers = () => {
        return [nameserver1, nameserver2, nameserver3].filter(Boolean);
    };

    const configChanged = () => {
        return ((nameServers().join(" ") !== (dns?.nameServers || "")) ||
            (policy !== (dns?.policy || "")) || (searchList !== (dns?.searchList || "")));
    };

    const handleSubmit = () => {
        if (configChanged())
            updateDnsSettings(dispatch, { nameServers: nameServers().join(" "), policy, searchList });
        onClose();
    };

    return (
        <ModalForm
            title={_("DNS Settings")}
            isOpen={isOpen}
            onCancel={onClose}
            onSubmitLabel={_("Modify")}
            onSubmit={handleSubmit}
        >
            <FormGroup
                label={_("Policy")}
                fieldId="dns_policy"
                helperText={_("Defines the DNS merge policy as documented in netconfig(8) manual page.")}
            >
                <TextInput
                    isRequired
                    id="dns_policy"
                    value={policy}
                    onChange={setPolicy}
                />
            </FormGroup>
            <FormGroup
                label={_("Search List")}
                isRequired
                fieldId="dns_search_list"
                helperText={_("Space separated list of DNS domain names used for host-name lookup")}
            >
                <TextInput
                    id="dns_search_list"
                    placeholder={_("example.com another.com")}
                    value={searchList}
                    onChange={setSearchList}
                />
            </FormGroup>
            <FormGroup
                label={_("Static Nameservers")}
                helperText={_("Namserver IP address used for host-name lookup.")}
            >
                <IPInput
                    id="dns_nameserver_one"
                    onChange={setNameserver1}
                    placeholder={_("Nameserver IP")}
                    value={nameserver1}
                    onError={(value) => console.log("Invalid value", value, "for nameserver 1")}
                />
            </FormGroup>

            <FormGroup>
                <IPInput
                    id="dns_nameserver_two"
                    placeholder={_("Nameserver IP")}
                    value={nameserver2}
                    onChange={setNameserver2}
                    onError={(value) => console.log("Invalid value", value, "for nameserver 2")}
                />
            </FormGroup>
            <FormGroup>
                <IPInput
                    id="dns_nameserver_three"
                    placeholder={_("Nameserver IP")}
                    value={nameserver3}
                    onChange={setNameserver3}
                    onError={(value) => console.log("Invalid value", value, "for nameserver 3")}
                />
            </FormGroup>
        </ModalForm>
    );
};

export default DnsSettingsForm;
