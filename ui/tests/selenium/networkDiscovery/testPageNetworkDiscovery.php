<?php
/*
** Zabbix
** Copyright (C) 2001-2023 Zabbix SIA
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

require_once dirname(__FILE__).'/../../include/CLegacyWebTest.php';
require_once dirname(__FILE__).'/../behaviors/CMessageBehavior.php';
require_once dirname(__FILE__).'/../traits/TableTrait.php';

/**
 * @backup drules
 *
 * @onBefore prepareDiscoveryRulesData
 */

class testPageNetworkDiscovery extends CLegacyWebTest {

	use TableTrait;

	/**
	 * Attach MessageBehavior to the test.
	 *
	 * @return array
	 */
	public function getBehaviors() {
		return [CMessageBehavior::class];
	}

	/**
	 * SQL query which selects all values from table drules.
	 */
	private $SQL = 'SELECT * FROM drules';

	/**
	 * Create discovery rules for testPageNetworkDiscovery autotest.
	 */
	private function prepareDiscoveryRulesData() {
		CDataHelper::call('drule.create', [
			[
				'name' => 'External network',
				'iprange' => '192.168.3.1-255',
				'delay' => 600,
				'status' => 0,
				'dchecks' => [
					[
						'type' => SVC_AGENT,
						'key_' => 'system.uname',
						'ports' => 10050,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_FTP,
						'ports' => '21,1021',
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_HTTP,
						'ports' => '80,8080',
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_ICMPPING,
						'ports' => 0,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_IMAP,
						'ports' => '143-145',
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_LDAP,
						'ports' => 389,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_NNTP,
						'ports' => 119,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_POP,
						'ports' => 110,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_SMTP,
						'ports' => 25,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_SNMPv1,
						'key_' => 'ifIndex0',
						'snmp_community' => 'public',
						'ports' => 161,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_SNMPv2c,
						'key_' => 'ifInOut0',
						'snmp_community' => 'private1',
						'ports' => 162,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_SNMPv3,
						'key_' => 'ifIn0',
						'ports' => 161,
						'snmpv3_securityname' => 'private2',
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_SSH,
						'ports' => 22,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_TCP,
						'ports' => '10000-20000',
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_TELNET,
						'ports' => 23,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					],
					[
						'type' => SVC_AGENT,
						'key_' => 'agent.uname',
						'ports' => 10050,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					]
				]
			],
			[
				'name' => 'Discovery rule for update',
				'iprange' => '192.168.3.1-255',
				'proxy_hostid' => 20000,
				'delay' => 600,
				'status' => 0,
				'dchecks' => [
					[
						'type' => SVC_ICMPPING,
						'ports' => 0,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					]
				]
			],
			[
				'name' => 'Disabled discovery rule for update',
				'iprange' => '192.168.3.1-255',
				'proxy_hostid' => 20000,
				'delay' => 600,
				'status' => 1,
				'dchecks' => [
					[
						'type' => SVC_ICMPPING,
						'ports' => 0,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					]
				]
			],
			[
				'name' => 'Discovery rule to check delete',
				'iprange' => '192.168.3.1-255',
				'proxy_hostid' => 20000,
				'delay' => 600,
				'status' => 1,
				'dchecks' => [
					[
						'type' => SVC_ICMPPING,
						'ports' => 0,
						'snmpv3_securitylevel' => 0,
						'uniq' => 0
					]
				]
			]
		]);
		$druleid = CDataHelper::getIds('name');
	}

	/**
	 * Function which checks layout of Network Discovery page.
	 */
	public function testPageNetworkDiscovery_CheckLayout() {
		$this->page->login()->open('zabbix.php?action=discovery.list&sort=name&sortorder=DESC');
		$table = $this->query('class:list-table')->asTable()->one();
		$form = $this->query('name:zbx_filter')->asForm()->one();

		$this->page->assertTitle('Configuration of discovery rules');
		$this->page->assertHeader('Discovery rules');
		$this->assertEquals(['', 'Name', 'IP range', 'Proxy', 'Interval', 'Checks', 'Status'], $table->getHeadersText());
		$this->assertEquals(['Name', 'Status'], $form->getLabels()->asText());

		// Check if default enabled buttons are clickable.
		$this->assertEquals(3, $this->query('button', ['Create discovery rule', 'Apply', 'Reset'])
				->all()->filter(CElementFilter::CLICKABLE)->count()
		);

		// Check if default disabled buttons are not clickable.
		$this->assertEquals(0, $this->query('button', ['Enable', 'Disable', 'Delete'])
				->all()->filter(CElementFilter::CLICKABLE)->count()
		);

		// Check if filter collapses/ expands.
		foreach (['true', 'false'] as $status) {
			$this->assertTrue($this->query('xpath://li[@aria-expanded='.CXPathHelper::escapeQuotes($status).']')
					->one()->isPresent()
			);
			$this->query('xpath://a[@id="ui-id-1"]')->one()->click();
		}

		// Check if fields "Name" length is as expected.
		$this->assertEquals(255, $form->query('xpath:.//input[@name="filter_name"]')
				->one()->getAttribute('maxlength')
		);

		/**
		 * Check if counter displays correct number of rows and check if previously disabled buttons are enabled,
		 * upon selecting discovery rules.
		 */
		$selected_counter = $this->query('id:selected_count')->one();
		$this->assertEquals('0 selected', $selected_counter->getText());
		$this->query('id:all_drules')->asCheckbox()->one()->set(true);
		$this->assertEquals(CDBHelper::getCount($this->SQL).' selected', $selected_counter->getText());
		foreach (['Enable', 'Disable', 'Delete'] as $buttons ){
			$this->assertTrue($this->query('button:'.$buttons)->one()->isEnabled());
		}
	}

	/**
	 * Function which checks sorting by Name column.
	 */
	public function testPageNetworkDiscovery_CheckSorting() {
		$this->page->login()->open('zabbix.php?action=discovery.list&sort=name&sortorder=ASC');
		$table = $this->query('class:list-table')->asTable()->one();
		$table->query('xpath:.//a[text()="Name"]')->one()->click();
		$column_values = $this->getTableColumnData('Name');

		foreach (['asc', 'desc'] as $sorting) {
			$expected = ($sorting === 'asc') ? $column_values : array_reverse($column_values);
			$this->assertEquals($expected, $this->getTableColumnData('Name'));
			$table->query('xpath:.//a[text()="Name"]')->one()->click();
		}
	}

	public function getFilterData() {
		return [
			[
				[
					'filter' => [
						'Name' => 'network'
					],
					'expected' => [
						'External network',
						'Local network'
					]
				]
			],
			[
				[
					'filter' => [
						'Name' => '',
						'Status' => 'Enabled'
					],
					'expected' => [
						'Discovery rule for update',
						'External network'
					]
				]
			],
			[
				[
					'filter' => [
						'Name' => '',
						'Status' => 'Disabled'
					],
					'expected' => [
						'Disabled discovery rule for update',
						'Discovery rule to check delete',
						'Local network'
					]
				]
			],
			[
				[
					'filter' => [
						'Name' => ''
					],
					'expected' => [
						'Disabled discovery rule for update',
						'Discovery rule for update',
						'Discovery rule to check delete',
						'External network',
						'Local network'
					]
				]
			]
		];
	}

	/**
	 * Check Network Discovery pages filter.
	 *
	 * @dataProvider getFilterData
	 */
	public function testPageNetworkDiscovery_CheckFilter($data) {
		$this->page->login()->open('zabbix.php?action=discovery.list');
		$form = $this->query('name:zbx_filter')->asForm()->waitUntilVisible()->one();
		$form->fill(CTestArrayHelper::get($data, 'filter'));
		$form->submit();
		$this->page->waitUntilReady();
		$this->assertTableDataColumn(CTestArrayHelper::get($data, 'expected'));
		$this->query('button:Reset')->one()->click();
		$this->assertTableStats(CDBHelper::getCount($this->SQL));
	}


	/**
	 *
	 */
	public function testPageNetworkDiscovery_SingleLink() {

	}

	/**
	 *
	 */
	public function testPageNetworkDiscovery_SingleActions() {

	}

	/**
	 *
	 */
	public function testPageNetworkDiscovery_MassActions() {

	}











	/**
	 * Function for all possible actions.
	 *
	 * @param array $name 		name of Discovery Rule
	 * @param array $default	default status of Discovery Rule
	 * @param array $link		if Discovery Rule's status will be changed by link
	 * @param array $single		single Discovery Rule or no
	 * @param array $cancel		if cancel action is expected
	 */
	protected function allActions($name, $default, $link, $single, $cancel) {
		$old_hash = CDBHelper::getHash($this->SQL);
		$this->page->login()->open('zabbix.php?action=discovery.list&sort=name&sortorder=DESC');
		$table = $this->query('class:list-table')->asTable()->one();
		$count = CDBHelper::getCount($this->SQL);

		if ($link === true) {
			$row = $table->findRow('Name', $name);
			$row->getColumn('Status')->query('xpath:.//a')->one()->click();
			if ($default === DRULE_STATUS_DISABLED) {
				$this->assertMessage(TEST_GOOD, 'Discovery rule enabled');
			}
			else {
				$this->assertMessage(TEST_GOOD, 'Discovery rule disabled');
			}
		}
		else {
			foreach (['Enable', 'Disable', 'Delete'] as $status) {
				if ($single === true) {
					$plural = '';
					$this->selectTableRows($name);
					$this->assertSelectedCount(1);
				}
				else {
					$plural = 's';
					$this->selectTableRows();
					$this->assertSelectedCount($count);
				}
				$this->query('button:'.$status)->one()->waitUntilClickable()->click();
				$this->assertEquals($status.' selected discovery rule'.$plural.'?', $this->page->getAlertText());

				if ($cancel === true) {
					$this->page->dismissAlert();
					$this->page->waitUntilReady();

					if ($single === true) {
						$this->assertSelectedCount(1);
					}
					else {
						$this->assertSelectedCount($count);
					}
					$this->assertEquals($old_hash, CDBHelper::getHash($this->SQL));
				}
				else {
					$this->page->acceptAlert();
					$this->page->waitUntilReady();
					$this->assertMessage(TEST_GOOD, 'Discovery rule'.$plural.' '.lcfirst($status).'d');
					CMessageElement::find()->one()->close();
					if ($status === 'Delete') {
						$this->assertSelectedCount(0);
						$this->assertTableStats($single === false ? 0 : $count - count($name));
						$this->assertEquals(0, ($single === false) ? $count
							: CDBHelper::getCount('SELECT NULL FROM drule WHERE name IN ('.CDBHelper::escape($name).')')
						);
					}
				}
			}
		}
	}

	/**
	 *
	 */
	public function testPageNetworkDiscovery_Cancel() {

	}


	/**
	 *
	 */
	public function testPageNetworkDiscovery_Delete() {


	}




}
