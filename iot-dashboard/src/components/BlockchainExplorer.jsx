import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Spinner, 
  Alert, 
  Badge, 
  Button, 
  ButtonGroup, 
  Form, 
  InputGroup,
  Pagination,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import axios from '../utils/axiosInstance';
import { CSVLink } from 'react-csv';
import { FaSearch, FaDownload, FaExternalLinkAlt, FaCopy } from 'react-icons/fa';

const BlockchainExplorer = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/admin/blockchain_records`);
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch blockchain records');
        console.error('Blockchain records fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [API_URL]);

  useEffect(() => {
    let results = transactions;
    
    if (searchTerm) {
      results = results.filter(tx => 
        tx.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.tx_hash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter === 'ANOMALY') {
      results = results.filter(tx => tx.isAnomaly);
    } else if (filter === 'NORMAL') {
      results = results.filter(tx => !tx.isAnomaly);
    }
    
    setFilteredTransactions(results);
    setCurrentPage(1);
  }, [transactions, searchTerm, filter]);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const prepareCSVData = () => {
    return filteredTransactions.map(tx => ({
      'Timestamp': new Date(tx.timestamp * 1000).toLocaleString(),
      'Device ID': tx.deviceId,
      'Transaction Hash': tx.tx_hash,
      'Status': tx.isAnomaly ? 'Anomaly' : 'Normal',
      'Type': 'Data Storage',
      'Blockchain Link': `https://testnet.bscscan.com/tx/${tx.tx_hash}`
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading blockchain records...</p>
    </div>
  );

  if (error) return (
    <Alert variant="danger" className="m-3">
      {error}
    </Alert>
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Blockchain Explorer</h2>
        <div>
          <CSVLink 
            data={prepareCSVData()} 
            filename={`blockchain-records-${new Date().toISOString().split('T')[0]}.csv`}
            className="btn btn-success me-2"
          >
            <FaDownload className="me-2" />
            Export CSV
          </CSVLink>
        </div>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h5 className="text-primary mb-3">Contract Information</h5>
              <div className="d-flex align-items-center mb-2">
                <strong className="me-2" style={{ width: '140px' }}>Contract Address:</strong>
                <span className="text-muted font-monospace">
                  {process.env.REACT_APP_CONTRACT_ADDRESS}
                </span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ms-2 p-0"
                  onClick={() => copyToClipboard(process.env.REACT_APP_CONTRACT_ADDRESS)}
                >
                  <FaCopy size={14} />
                </Button>
              </div>
              <div className="d-flex align-items-center mb-2">
                <strong className="me-2" style={{ width: '140px' }}>Network:</strong>
                <Badge bg="warning" className="text-dark">BSC Testnet</Badge>
              </div>
            </div>
            <div className="col-md-6">
              <h5 className="text-primary mb-3">Statistics</h5>
              <div className="d-flex mb-2">
                <strong className="me-2" style={{ width: '140px' }}>Total Transactions:</strong>
                <span>{transactions.length}</span>
              </div>
              <div className="d-flex mb-2">
                <strong className="me-2" style={{ width: '140px' }}>Anomalies:</strong>
                <span>{transactions.filter(tx => tx.isAnomaly).length}</span>
              </div>
              <div className="d-flex">
                <strong className="me-2" style={{ width: '140px' }}>Last Update:</strong>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <Card.Title className="mb-3 mb-md-0">Transaction History</Card.Title>
            <div className="d-flex flex-column flex-md-row gap-2">
              <InputGroup style={{ width: '250px' }}>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search device or hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <ButtonGroup>
                <Button 
                  variant={filter === 'ALL' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilter('ALL')}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'ANOMALY' ? 'danger' : 'outline-danger'}
                  onClick={() => setFilter('ANOMALY')}
                >
                  Anomalies
                </Button>
                <Button 
                  variant={filter === 'NORMAL' ? 'success' : 'outline-success'}
                  onClick={() => setFilter('NORMAL')}
                >
                  Normal
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover striped bordered>
              <thead className="table-dark">
                <tr>
                  <th>Timestamp</th>
                  <th>Device ID</th>
                  <th>Transaction Hash</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td className="align-middle">
                        {new Date(tx.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="align-middle">
                        <Badge bg="secondary">{tx.deviceId}</Badge>
                      </td>
                      <td className="align-middle font-monospace">
                        {tx.tx_hash.substring(0, 10)}...{tx.tx_hash.substring(tx.tx_hash.length - 10)}
                      </td>
                      <td className="align-middle">
                        <Badge bg={tx.isAnomaly ? 'danger' : 'success'}>
                          {tx.isAnomaly ? 'Anomaly' : 'Normal'}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`https://testnet.bscscan.com/tx/${tx.tx_hash.startsWith('0x') ? tx.tx_hash : '0x' + tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                        >
                          <FaExternalLinkAlt className="me-1" />
                          View
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard(tx.tx_hash)}
                        >
                          <FaCopy className="me-1" />
                          Copy
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {filter === 'ALL' 
                        ? 'No transactions found' 
                        : `No ${filter.toLowerCase()} transactions found`}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {filteredTransactions.length > transactionsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={2000} 
          autohide
          bg="success"
        >
          <Toast.Body className="text-white">
            Copied to clipboard!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default BlockchainExplorer;