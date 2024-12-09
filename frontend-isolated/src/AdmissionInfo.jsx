import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from './util/ConfigContext';
import { useUser } from './auth/UserContext';
import secureFetch from './auth/SecureFetch';

function AddLog({admissionID, updateLogsTbl, showLogModal}) {
    const { serverUrl } = useConfig();
    const [loading, setLoading] = useState(false)
    const [model, setModel] = useState({});
    const [errors, setErrors] = useState({});
  
    const validateModel = () => {
      const foundErrors = validateLog(model);
      setErrors(foundErrors);
      return Object.keys(foundErrors).length === 0;
    };

    const AddLog = (e) => {
        e.preventDefault();
        if (!serverUrl) return;
        if (!validateModel()) return;
        setLoading(true)

        const now = new Date();

        const payload = {
            admissionID: admissionID,
            patientLogMsg: model.patientLogMsg,
            patientLogBy: model.patientLogBy,
            patientLogOn: now.toISOString()
        }

        secureFetch(`${serverUrl}/patient-logs/patient-log`, 
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: 'include',
              body: JSON.stringify(payload)
            })
            .then(async (response) => {
              const responseBody = await response.json()
              console.log(response)
              if(response.status !== 200) {
                console.log(responseBody);
                const errorString = responseBody.map((error) => error.message).join('\n');
                alert(errorString);
              } else {
                console.log(responseBody)
                alert(`Successfully added log for admission No. ${admissionID}`);
                updateLogsTbl();
              }
            })
            .catch(error => console.error(error)).
            finally(() => {
              setLoading(false)
            })
    }

    return (
        <div className="add-item-container">
            <h4 className="text-2xl mb-2">Add a Log</h4>
            <form>
                
                <label className="form-control w-full mb-2">
                    <div className="label justify-end">
                        <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control w-full">
                        <textarea className={"textarea textarea-floating peer " + 
                        (errors.patientLogMsg && "is-invalid")}
                        name='patientLogMsg' placeholder=""
                        onChange={e => setModel(
                            prev => ({...prev, patientLogMsg: e.target.value})
                        )}></textarea>
                        <span className="textarea-floating-label">Log Message</span>
                    </div>
                    {errors.patientLogMsg && (
                        <div className="label">
                            <span className="label-text-alt"></span>
                            <span className="label-text-alt">{errors.patientLogMsg}</span>
                        </div>
                    )}
                </label>

                <label>
                    <div className="label hidden">
                      <span className="label-text-alt"></span>
                    </div>
                    <div className="form-control">
                      <input type="text" name='patientLogBy' placeholder='' 
                        className={"input input-floating peer " + 
                          (errors.patientLogBy && "is-invalid")}
                          onChange={e => setModel(
                            prev => ({...prev, patientLogBy: e.target.value})
                          )} />
                      <span className="input-floating-label">Logged By</span>
                    </div>
                    <div className="label">
                        <span className="label-text-alt"></span>
                      {errors.patientLogBy && (
                        <span className="label-text-alt">{errors.patientLogBy}</span>
                      )}
                    </div>
                    <button onClick={e => AddLog(e)} className="w-full btn btn-primary">Add Log</button>
                </label>

            </form>
        </div>
    )
}

function LogModal({admissionID, logID, closeModal}) {
    const { serverUrl } = useConfig();
    const [loading, setLoading] = useState(false)
    const [model, setModel] = useState({})

    const FetchLog = () => {
        if (!serverUrl) return;
        setLoading(true)
        secureFetch(`${serverUrl}/patient-logs/${logID}`, 
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setModel(data))
        .catch(error => console.error(error)).
        finally(() => {
        setLoading(false)
        })
    }

    useEffect(() => {
        FetchLog();
    }, [logID]);

    return (
        <div className='qe-modal-overlay'>   
        { loading ? (
            <span>Loading...</span>
            ) : (
            <div className="qe-modal gap-4 !w-full !max-w-2xl" style={{ display: 'flex' }}>   
                <h4 className="text-2xl mb-2 text-nowrap">Log No. {logID} for Admission No. {admissionID}</h4>
                <div className="form-control w-full">
                    <textarea className="textarea textarea-floating peer" value={model.patientLogMsg} readOnly></textarea>
                    <span className="textarea-floating-label">Log Message</span>
                </div>
                <div className='flex gap-4'>

                <div className="form-control w-96">
                    <input type="text" value={model.patientLogBy} className="input input-floating peer" readOnly />
                    <label className="input-floating-label">Logged By</label>
                </div>
                <div className="form-control w-96">
                    <input type="text" value={model.patientLogOn} className="input input-floating peer" readOnly />
                    <label className="input-floating-label">Logged On</label>
                </div>

                </div>
                <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
            )
        }
        </div>
    )
}

const validateLog = (model) => {
    const errors = {}
    if (!model.patientLogMsg) {
        errors.patientLogMsg = "Please enter a log message"
    }
    if (!model.patientLogBy) {
        errors.patientLogBy = "Please enter the name of the person logging"
    }
    return errors
}

function AdmissionInfo({admissionID, closeModal}) {
    const { serverUrl } = useConfig();
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [patientLogs, setPatientLogs] = useState([]);

    const [logModalVisible, setLogModalVisible] = useState(false);
    const [logID, setLogID] = useState(null);

    const showLogModal = (id) => {
        setLogID(id);
        setLogModalVisible(true);
    }

    const closeLogModal = () => {
        setLogModalVisible(false);
    }

    const FetchPatientLogs = () => {
        if (!serverUrl) return;
        setLoading(true);
        secureFetch(`${serverUrl}/patient-logs/all/${admissionID}?` + new URLSearchParams({
            page: currentPage,
            size: itemsPerPage
        }).toString(), 
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            setPatientLogs(data)
            console.log(data)
        })
        .catch(error => console.error(error)).
        finally(() => {
            setLoading(false)
        })
    };

    const NextPage = () => {
      if (currentPage < patientLogs.totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    }
  
    const PreviousPage = () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }

    const formatDTStr = (dateStr) => {
        const date = new Date(dateStr);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short', // Shortened version of the month (e.g., "Dec")
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true, // 12-hour format; set to false for 24-hour format
        }).format(date);
        return formattedDate;
      };

    const truncateLongStr = (str, n) => {
    return (str.length > n) ? str.slice(0, n-1) + "\u2026" : str;
    }
      
    useEffect(() => {
        FetchPatientLogs()
    }, [currentPage, itemsPerPage])

    return (
        <>           
        <div className='qe-modal-overlay'>     
            { loading ? (
            <span>Loading...</span>
            ) : (
                <div className="qe-modal gap-4 !w-full !max-w-full flex">
                    <h4 className="text-2xl mb-2">Admission Details for No. {admissionID}</h4>
                    <div className='flex gap-4'>
                        {/* INFO SECTION */}
                        <div className='flex-1'>
                            INFO HERE
                        </div>
                        {/* LOGS SECTION */}
                        <div className='flex-1 flex flex-col gap-4'>
                            <div className="inventory-container">
                                <h4 className="text-2xl mb-2">Patient Logs</h4>
                                <table className='!mt-0'>
                                    <thead>
                                        <tr>
                                            <th>id</th>
                                            <th>Message</th>
                                            <th>By</th>
                                            <th>On</th>
                                            <th className='!text-center'>Actions</th>
                                        </tr>
                                    </thead>
                                    {
                                        loading ? (
                                            <tbody>
                                              <tr>
                                                <td colSpan="5">Loading...</td>
                                              </tr>
                                            </tbody>
                                        ) : (
                                            <tbody>
                                                {
                                                    patientLogs?.content?.map((log) => (
                                                        <tr key={log.id}>
                                                            <td>{log.id}</td>
                                                            <td>{truncateLongStr(log.patientLogMsg, 10)}</td>
                                                            <td>{log.patientLogBy}</td>
                                                            <td>{formatDTStr(log.patientLogOn)}</td>
                                                            <td className='!text-center'>
                                                                <button onClick={() => showLogModal(log.id)} className='btn btn-primary'>View</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        )
                                    }
                                </table>
                                {
                                    !loading && patientLogs?.pageable ? (
                                    <div className="pagination-controls">
                                        <button 
                                        onClick={PreviousPage} 
                                        disabled={currentPage === 0}
                                        >
                                        Previous
                                        </button>
                                        <span className='text-black'>
                                        Page {currentPage + 1} of {patientLogs.totalPages}
                                        </span>
                                        <button 
                                        onClick={NextPage} 
                                        disabled={currentPage === patientLogs.totalPages}
                                        >
                                        Next
                                        </button>
                                    </div>
                                    ) : null
                                }
                            </div>
                            <AddLog admissionID={admissionID} updateLogsTbl={FetchPatientLogs} showLogModal={showLogModal} />   

                        </div>
                    </div>
                    <button onClick={closeModal} className="btn btn-secondary">Close</button>
                </div>
            )}
        </div>
        {logModalVisible && (logID !== null) && (
            <LogModal
                admissionID={admissionID}
                logID={logID}
                closeModal={closeLogModal}
            />
        )}
        </>
    )
}

export default AdmissionInfo;