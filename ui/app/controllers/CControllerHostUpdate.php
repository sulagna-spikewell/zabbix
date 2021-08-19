<?php declare(strict_types = 1);
/*
** Zabbix
** Copyright (C) 2001-2021 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/


/**
 * Controller for host update.
 */
class CControllerHostUpdate extends CControllerHostUpdateGeneral {

	protected function checkInput(): bool {
		return parent::checkInputFields(['hostid' => 'required|db hosts.hostid'] + self::getValidationFields());
	}

	protected function checkPermissions(): bool {
		if (!$this->checkAccess(CRoleHelper::UI_CONFIGURATION_HOSTS)) {
			return false;
		}

		$this->host = API::Host()->get([
			'output' => ['hostid', 'host', 'name', 'status', 'description', 'proxy_hostid', 'ipmi_authtype',
				'ipmi_privilege', 'ipmi_username', 'ipmi_password', 'tls_connect', 'tls_accept', 'tls_issuer',
				'tls_subject', 'flags', 'inventory_mode'
			],
			'hostids' => $this->getInput('hostid'),
			'editable' => true
		]);

		if (!$this->host) {
			access_deny(ACCESS_DENY_OBJECT);
		}

		$this->host = $this->host[0];

		return true;
	}

	protected function doAction(): void {
		$output = [];
		$host = [
			'hostid' => $this->host['hostid'],
			'host' => $this->getInput('host', $this->host['host']),
			'name' => $this->getInput('visiblename', $this->host['name']),
			'status' => $this->getInput('status', $this->host['status']),
			'proxy_hostid' => $this->getInput('proxy_hostid', $this->host['proxy_hostid']),
			'groups' => $this->processHostGroups($this->getInput('groups', [])),
			'interfaces' => $this->processHostInterfaces($this->getInput('interfaces', [])),
			'tags' => $this->processTags($this->getInput('tags', [])),
			'templates' => $this->processTemplates([
				$this->getInput('add_templates', []), $this->getInput('templates', [])
			]),
			'clear_templates' => zbx_toObject($this->getInput('clear_templates', []), 'templateid'),
			'macros' => $this->processUserMacros($this->getInput('macros', [])),
			'inventory' => ($this->getInput('inventory_mode', $this->host['inventory_mode']) != HOST_INVENTORY_DISABLED)
				? $this->getInput('host_inventory', [])
				: [],
			'tls_connect' => $this->getInput('tls_connect', $this->host['tls_connect']),
			'tls_accept' => $this->getInput('tls_accept', $this->host['tls_accept'])
		];

		$host_properties = [
			'description', 'ipmi_authtype', 'ipmi_privilege', 'ipmi_username', 'ipmi_password', 'tls_subject',
			'tls_issuer', 'inventory_mode'
		];

		foreach ($host_properties as $prop) {
			if (!array_key_exists($prop, $this->host) || $this->getInput($prop, '') !== $this->host[$prop]) {
				$host[$prop] = $this->getInput($prop, '');
			}
		}

		$this->getInputs($host, ['tls_psk_identity', 'tls_psk']);

		if ($host['tls_connect'] != HOST_ENCRYPTION_PSK && !($host['tls_accept'] & HOST_ENCRYPTION_PSK)) {
			unset($host['tls_psk'], $host['tls_psk_identity']);
		}

		if ($host['tls_connect'] != HOST_ENCRYPTION_CERTIFICATE
				&& !($host['tls_accept'] & HOST_ENCRYPTION_CERTIFICATE)) {
			unset($host['tls_issuer'], $host['tls_subject']);
		}

		if ($this->host['flags'] == ZBX_FLAG_DISCOVERY_CREATED) {
			$host = array_intersect_key($host, array_flip(['hostid', 'status', 'inventory', 'description']));
		}

		$hostids = API::Host()->update($host);

		if ($hostids !== false && $this->processValueMaps($this->getInput('valuemaps', []))) {
			$messages = get_and_clear_messages();
			$details = [];

			foreach ($messages as $message) {
				$details[] = $message['message'];
			}

			ob_start();
			uncheckTableRows('hosts');

			$output = [
				'message' => makeMessageBox(ZBX_STYLE_MSG_GOOD, $messages, _('Host updated'), true, false)->toString(),
				'title' => _('Host updated'),
				'details' => $details,
				'script_inline' => ob_get_clean()
			];
		}

		if (!$output && ($messages = getMessages()) !== null) {
			$output = ['errors' => $messages->toString()];
		}

		$response = $output
			? (new CControllerResponseData(['main_block' => json_encode($output)]))->disableView()
			: new CControllerResponseFatal();

		$this->setResponse($response);
	}

	/**
	 * Save valuemaps.
	 *
	 * @param array $valuemaps Submitted valuemaps.
	 *
	 * @return bool Whether mappings saved/deleted.
	 */
	private function processValueMaps(array $valuemaps): bool {
		$ins_valuemaps = [];
		$upd_valuemaps = [];

		$del_valuemapids = API::ValueMap()->get([
			'output' => [],
			'hostids' => $this->host['hostid'],
			'preservekeys' => true
		]);

		foreach ($valuemaps as $valuemap) {
			if (array_key_exists('valuemapid', $valuemap)) {
				$upd_valuemaps[] = $valuemap;
				unset($del_valuemapids[$valuemap['valuemapid']]);
			}
			else {
				$ins_valuemaps[] = $valuemap + ['hostid' => $this->host['hostid']];
			}
		}

		if ($upd_valuemaps && !API::ValueMap()->update($upd_valuemaps)) {
			return false;
		}

		if ($ins_valuemaps && !API::ValueMap()->create($ins_valuemaps)) {
			return false;
		}

		if ($del_valuemapids && !API::ValueMap()->delete(array_keys($del_valuemapids))) {
			return false;
		}

		return true;
	}
}
