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
    Alert,
    FormGroup,
    HelperText,
    HelperTextItem,
    TextInput
} from '@patternfly/react-core';
import { useNetworkDispatch, updateDnsSettings } from '../context/network';
import ModalForm from './ModalForm';
import IPInput from './IPInput';
import { isValidIP, isValidDomain } from '../lib/utils';
import { createDnsSettings } from '../lib/model/dns';
import deep_equal from 'deep-equal';

const _ = cockpit.gettext;

const DnsSettingsForm = ({ isOpen, onClose, dns }) => {
    const dispatch = useNetworkDispatch();
    const [nameserver1, setNameserver1] = useState(dns.nameServers[0]);
    const [nameserver2, setNameserver2] = useState(dns.nameServers[1]);
    const [nameserver3, setNameserver3] = useState(dns.nameServers[2]);
    const [policy, setPolicy] = useState(dns.policy);
    const [searchListInput, setSearchListInput] = useState(dns.searchList.join(" "));
    const [errorMessages, setErrorMessages] = useState([]);

    const validate = () => {
        const errors = [];

        // Clean previous error messages
        setErrorMessages([]);

        if (searchList().some((d) => !isValidDomain(d))) {
            errors.push({
                key: 'invalid-searchlist',
                message: _("There are invalid domains in the search list.")
            });

            setSearchListInput(searchList().join(" "));
        }

        if (nameServers().some((s) => !isValidIP(s))) {
            errors.push({
                key: 'invalid-nameservers',
                message: _("There are invalid name servers.")
            });
        }

        setErrorMessages(errors);

        return (errors.length == 0);
    };

    const searchList = () => searchListInput.split(" ").filter(Boolean);

    const nameServers = () => [nameserver1, nameserver2, nameserver3].filter(Boolean);

    const configChanged = () => {
        return !deep_equal(dns, createDnsSettings({ policy, searchList: searchList(), nameServers: nameServers() }));
    };

    const handleSubmit = () => {
        if (!validate()) return false;

        if (configChanged()) {
            updateDnsSettings(dispatch, { nameServers: nameServers(), policy, searchList: searchList() });
        }

        onClose();
    };

    /**
     * Renders error messages in an Patternfly/Alert component, if any
     */
    const renderErrors = () => {
        if (errorMessages.length === 0) return null;

        return (
            <Alert
                isInline
                variant="danger"
                aria-live="polite"
                title={_("Data is not valid, please check it")}
            >
                {errorMessages.map(({ key, message }) => <p key={key}>{message}</p>)}
            </Alert>
        );
    };

    const handleError = (value) => console.log("Invalid value", value, "for nameserver 1");

    return (
        <ModalForm
            title={_("DNS Settings")}
            isOpen={isOpen}
            onCancel={onClose}
            onSubmit={handleSubmit}
        >
            <>
                {renderErrors()}
                <FormGroup
                    label={_("Policy")}
                    fieldId="dns_policy"
                >
                    <TextInput
                        isRequired
                        id="dns_policy"
                        value={policy}
                        onChange={(_e, val) => setPolicy(val)}
                    />
                    <HelperText>
                        <HelperTextItem>
                            {_("Defines the DNS merge policy as documented in netconfig(8) manual page.")}
                        </HelperTextItem>
                    </HelperText>
                </FormGroup>
                <FormGroup
                    label={_("Search List")}
                    isRequired
                    fieldId="dns_search_list"
                >
                    <TextInput
                        id="dns_search_list"
                        placeholder={_("example.com another.com")}
                        value={searchListInput}
                        onChange={(_e, val) => setSearchListInput(val)}
                    />
                    <HelperText>
                        <HelperTextItem>
                            {_("Space separated list of DNS domain names used for host-name lookup")}
                        </HelperTextItem>
                    </HelperText>
                </FormGroup>
                <FormGroup
                    label={_("Static Name Servers")}
                >
                    <IPInput
                        id="dns_nameserver_one"
                        onChange={(_e, val) => setNameserver1(val)}
                        placeholder={_("Nameserver IP")}
                        defaultValue={nameserver1}
                        onError={handleError}
                    />
                    <HelperText>
                        <HelperTextItem>
                            {_("Name Server IP address used for host-name lookup.")}
                        </HelperTextItem>
                    </HelperText>

                </FormGroup>

                <FormGroup>
                    <IPInput
                        id="dns_nameserver_two"
                        placeholder={_("Name Server IP")}
                        defaultValue={nameserver2}
                        onChange={(_e, val) => setNameserver2(val)}
                        onError={handleError}
                    />
                </FormGroup>
                <FormGroup>
                    <IPInput
                        id="dns_nameserver_three"
                        placeholder={_("Name Server IP")}
                        defaultValue={nameserver3}
                        onChange={(_e, val) => setNameserver3(val)}
                        onError={handleError}
                    />
                </FormGroup>
            </>
        </ModalForm>
    );
};

export default DnsSettingsForm;
