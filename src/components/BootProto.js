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
import { Modal, ModalVariant, Button, FormSelect, FormSelectOption, TextInputBase } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table'
import { useNetworkDispatch } from '../NetworkContext';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const BOOT_PROTOCOL_MODES = {
    none:    _("None"),
    static:  _("Static"),
    dhcp:    _("DHCP")
};

const bootProtocolOptions = Object.keys(BOOT_PROTOCOL_MODES).map(key => {
    return { value: key, label: BOOT_PROTOCOL_MODES[key] };
});

const linkText = (connection) => {
  if (!connection) {
      return _("Not configured") ;
  }

  if (connection.iP) {
    return connection.iP;
  }

  return BOOT_PROTOCOL_MODES[connection.bootProto];
};

const BootProto = ({ connection }) => {
    const [modal, setModal] = useState(false);
    const [bootProto, setBootProto] = useState(undefined);
    const [ip, setIp] = useState(connection?.ip || "");
    const [netmask, setNetmask] = useState(connection?.netmask || "");

    const dispatch = useNetworkDispatch();

    const updateConnection = () => {
        dispatch({
            type: 'update_connection',
            payload: {
                id: connection.id,
                changes: { bootProto, ip, netmask }
            }
        });

        setModal(false);
    };

    const renderAddressFields = () => {
      return (
          <Table
              aria-label={_("Static address")}
              variant={TableVariant.compact}
              cells={[_("IP"), _("Netmask")]}
              rows={[
                {
                    cells: [
                        // NOTE: there is a bug with TextInput inside a Table component. The
                        // workaround is to use TextInputBase instead.
                        // See https://github.com/patternfly/patternfly-react/issues/4072
                        <><TextInputBase placeholder={_("IP")} value={ip} onChange={(value) => setIp(value)} id={`connection-${connection?.id}-ip`} /></>,
                        <><TextInputBase placeholder={_("Netmask")} value={netmask} onChange={(value) => setNetmask(value)} id={`connection-${connection?.id}-netmask`} /></>
                    ]
                }
              ]}
          >
              <TableHeader />
              <TableBody />
          </Table>
      );
    };

    useEffect(() => {
        setBootProto(connection?.bootProto)
    }, [connection]);

    return (
        <>
            <a href="#" onClick={() => setModal(true)}>{linkText(connection)}</a>
            <Modal
                variant={ModalVariant.small}
                title={_("Boot Protocol")}
                isOpen={modal}
                actions={[
                    <Button key="confirm" variant="primary" onClick={updateConnection}>
                        {_("Change")}
                    </Button>,
                    <Button key="cancel" variant="link" onClick={() => setModal(false)}>
                        {_("Cancel")}
                    </Button>
                ]}
            >
                <FormSelect value={bootProto} onChange={setBootProto} id="bootProto">
                    {bootProtocolOptions.map((option, index) => (
                        <FormSelectOption key={index} value={option.value} label={option.label} />
                    ))}
                </FormSelect>

                {bootProto === "static" && renderAddressFields()}
            </Modal>
        </>
    );
};

export default BootProto;
