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
import WirelessForm from './WirelessForm';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const WirelessDetails = ({ iface, connection }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const { wireless } = connection;

    const renderLinkDetails = () => {
      return (
        <ul>
          <li>
            <a href="#" onClick={() => setFormOpen(true)}>{_("ESSID: ")}{wireless.essid}</a>
          </li>
          <li>
            <a href="#" onClick={() => setFormOpen(true)}>{_("MODE: ")}{wireless.mode}</a>
          </li>
          <li>
            <a href="#" onClick={() => setFormOpen(true)}>{_("AUTH MODE: ")}{wireless.authMode}</a>
          </li>

        </ul>
      )
    }

    return (
        <>
            { wireless && renderLinkDetails() }
            { isFormOpen && <WirelessForm isOpen={isFormOpen} iface={iface} connection={connection} onClose={() => setFormOpen(false)} /> }
        </>
    );
};

export default WirelessDetails;
