<?php
/*
** Copyright (C) 2001-2024 Zabbix SIA
**
** This program is free software: you can redistribute it and/or modify it under the terms of
** the GNU Affero General Public License as published by the Free Software Foundation, version 3.
**
** This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
** without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
** See the GNU Affero General Public License for more details.
**
** You should have received a copy of the GNU Affero General Public License along with this program.
** If not, see <https://www.gnu.org/licenses/>.
**/


/**
 * Database backend class for Oracle.
 */
class OracleDbBackend extends DbBackend {

	/**
	 * Check if 'dbversion' table exists.
	 *
	 * @return boolean
	 */
	protected function checkDbVersionTable() {
		$table_exists = DBfetch(DBselect("SELECT table_name FROM all_tables WHERE table_name='DBVERSION'"));

		if (!$table_exists) {
			$this->setError(_s('Unable to determine current Zabbix database version: %1$s.',
				_s('the table "%1$s" was not found', 'dbversion')
			));

			return false;
		}

		return true;
	}

	/**
	 * Check is current connection contain requested cipher list.
	 *
	 * @return bool
	 */
	public function isConnectionSecure() {
		$this->setError('Secure connection for Oracle is not supported.');
		return false;
	}

	/**
	 * Create connection to database server.
	 *
	 * @param string $host         Host name.
	 * @param string $port         Port.
	 * @param string $user         User name.
	 * @param string $password     Password.
	 * @param string $dbname       Database name.
	 * @param string $schema       DB schema.
	 *
	 * @param
	 * @return resource|null
	 */
	public function connect($host, $port, $user, $password, $dbname, $schema) {
		$connect = '';

		if ($host) {
			$connect = '//'.$host.(($port) ? ':'.$port : '').(($dbname) ? '/'.$dbname : '');
		}
		elseif ($dbname) {
			$connect = $dbname;
		}

		$resource = @oci_connect($user, $password, $connect, 'UTF8');

		if (!$resource) {
			$ociError = oci_error();
			$this->setError('Error connecting to database: '.$ociError['message']);
			return null;
		}

		return $resource;
	}

	/**
	 * Initialize connection.
	 *
	 * @return bool
	 */
	public function init() {
		DBexecute('ALTER SESSION SET NLS_NUMERIC_CHARACTERS='.zbx_dbstr('. '));
	}

	/**
	 * Create INSERT SQL query.
	 * Creation example:
	 *	BEGIN
	 *	INSERT INTO usrgrp (usrgrpid, name, gui_access, users_status, debug_mode)
	 *		VALUES ('20', 'admins', '1', '0', '1');
	 *	INSERT INTO usrgrp (usrgrpid, name, gui_access, users_status, debug_mode)
	 *		VALUES ('21', 'users', '0', '0', '0');
	 *  END;
	 */
	public function createInsertQuery($table, array $fields, array $values) {
		$sql = 'BEGIN';
		$fields = '('.implode(',', $fields).')';
		foreach ($values as $row) {
			$sql .= ' INSERT INTO '.$table.' '.$fields.' VALUES ('.implode(',', array_values($row)).');';
		}
		$sql .= ' END;';

		return $sql;
	}

	/**
	 * Check database and table fields encoding.
	 *
	 * @return bool
	 */
	public function checkEncoding() {
		return $this->checkDatabaseEncoding();
	}

	/**
	 * Check database schema encoding. On error will set warning message.
	 *
	 * @return bool
	 */
	protected function checkDatabaseEncoding() {
		$row = DBfetch(DBselect('SELECT value,parameter FROM NLS_DATABASE_PARAMETERS'.
			' WHERE '.dbConditionString('parameter', ['NLS_CHARACTERSET', 'NLS_NCHAR_CHARACTERSET']).
				' AND '.dbConditionString('value', [ORACLE_UTF8_CHARSET, ORACLE_CESU8_CHARSET], true)
		));

		if ($row) {
			$this->setWarning(_s('Incorrect parameter "%1$s" value: %2$s.', $row['parameter'],
				_s('"%1$s" instead "%2$s"', $row['value'], ORACLE_UTF8_CHARSET.', '.ORACLE_CESU8_CHARSET)
			));
		}

		return !$row;
	}
}
