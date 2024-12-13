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
                    <textarea className="textarea textarea-floating peer" defaultValue={model.patientLogMsg} readOnly></textarea>
                    <span className="textarea-floating-label">Log Message</span>
                </div>
                <div className='flex gap-4'>

                <div className="form-control w-96">
                    <input type="text" defaultValue={model.patientLogBy} className="input input-floating peer" readOnly />
                    <label className="input-floating-label">Logged By</label>
                </div>
                <div className="form-control w-96">
                    <input type="text" defaultValue={model.patientLogOn} className="input input-floating peer" readOnly />
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
    const [patientOutOfER, setPatientOutOfER] = useState(false);
    const [hasMedicalRecord, setHasMedicalRecord] = useState(false);

    const [medicalRecordLoading, setMedicalRecordLoading] = useState(false);

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
    };
  
    const PreviousPage = () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    };

    const isPatientOutOfER = (status) => {
        return status === "paid" || status === "collateralized" || 
               status === "discharged" || status === "admitted-to-ward" || status?.includes("transferred");
    };

    const formatDTStr = (dateStr) => {
        if (dateStr === null || isNaN(new Date(dateStr).getTime())) return '';
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

    const extractFeetAndInches = (totFt) => {
        console.log(`totFt: ${totFt}`);
        if (totFt === null || isNaN(totFt)) return '';
        let feet = Math.floor(totFt);  
        let inches = Math.round((totFt - feet) * 12);  
        console.log(`feet: ${feet}, inches: ${inches}`);
        return { feet, inches };
    };

    const formateDStr = (dateStr) => {
        if (dateStr === null || isNaN(new Date(dateStr).getTime())) return '';
        const date = new Date(dateStr);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
        return formattedDate;
    };

    const truncateLongStr = (str, n) => {
    return (str.length > n) ? str.slice(0, n-1) + "\u2026" : str;
    };
      
    useEffect(() => {
        FetchPatientLogs()
    }, [currentPage, itemsPerPage])

    const [admission, setAdmission] = useState({});
    const FetchAdmission = () => {
        if (!serverUrl) return;
        setLoading(true)
        secureFetch(`${serverUrl}/patient-admissions/${admissionID}`, 
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setAdmission(data))
        .catch(error => console.error(error)).
        finally(() => {
          setLoading(false)
        })
      }

    const [patient, setPatient] = useState({});
    const FetchPatient = () => {
        if (!serverUrl) return;
        setLoading(true)
        secureFetch(`${serverUrl}/patients/${(admission.patientID)}`, 
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setPatient(data))
        .catch(error => console.error(error)).
        finally(() => {
        setLoading(false)
        })
    }

    const [medicalRecord, setMedicalRecord] = useState({});
    const FetchMedicalRecord = () => {
        if (!serverUrl) return;
        setMedicalRecordLoading(true)
        secureFetch(`${serverUrl}/patients-medical-info/${(admission.patientID)}`, 
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setMedicalRecord(data))
        .catch(error => console.error(error)).
        finally(() => {
            setMedicalRecordLoading(false)
        })
    }
    const medicalRecordExist = () => {
        if (!serverUrl) return;
        setLoading(true);
        secureFetch(`${serverUrl}/patients-medical-info/${admission.patientID}?`, 
        {
          method: "GET",
          headers: { "Content-Type": "application/json"},
          credentials: 'include'
        })
        .then(async (response) => {
          if(response.status === 200) {
            setHasMedicalRecord(true);
          } else {        
            setHasMedicalRecord(false);
          }
        })
        .catch(error => console.error(error)).
        finally(() => {
          setLoading(false);
        });
      }

    useEffect(() => {
        FetchAdmission();
        (admission.patientStatus && setPatientOutOfER(isPatientOutOfER(admission.patientStatus)));
        if (admission.patientID) {
            FetchPatient();
            FetchMedicalRecord();
            medicalRecordExist();
        }      
        
    }, [admissionID, admission.patientID, admission.patientStatus]);

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
                        <div className='flex-1 flex flex-col gap-4'>
                            {/* Admission Info */}
                            <div className="inventory-container !flex-none gap-4">
                                <h4 className="text-2xl mb-2">Admission Details</h4>
                                <div className='flex gap-4'>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.id} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">ID</label>
                                    </div>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.patientTriage} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Triage</label>
                                    </div>
                                </div>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.patientName} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Patient Name</label>
                                    </div>
                                <div className='flex gap-4'>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.patientBedLocCode} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Bed Location Code</label>
                                    </div>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.patientStatus} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Status</label>
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={formatDTStr(admission.patientAdmitOn)} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Admitted On</label>
                                    </div>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={formatDTStr(admission.patientOutOn)} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Out of E.R. Since</label>
                                    </div>
                                </div>
                                    <div className="form-control w-full">
                                        <input type="text" defaultValue={admission.patientERCause} className="input input-floating peer" readOnly />
                                        <label className="input-floating-label">Status</label>
                                    </div>
                            </div>
                            {/* Patient Info*/}
                            {admission.patientID && 
                                <div className="inventory-container !flex-none gap-4">                                
                                    <h4 className="text-2xl mb-2">Patient Details</h4>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-1/2">
                                            <input type="text" defaultValue={patient.id} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">ID</label>
                                        </div>
                                    </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientFullName} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Full Name</label>
                                        </div>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientGender} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Gender</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={formateDStr(patient.patientDOB)} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Birthdate</label>
                                        </div>
                                    </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientAddress} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Address</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientContactNum} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Contact Number</label>
                                        </div>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientEmergencyContactName} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Emergency Contact</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientEmergencyContactNum} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Emergency Contact Number</label>
                                        </div>
                                    </div>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientPWDID} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">PWD ID (if PWD)</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={patient.patientSeniorID} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Senior Citizen ID (if senior)</label>
                                        </div>
                                    </div>                                    
                                </div>
                            }
                            {/* Medical Info */}
                            {admission.patientID && hasMedicalRecord && !medicalRecordLoading &&
                                <div className="inventory-container !flex-none gap-4">                   
                                    <h4 className="text-2xl mb-2">Medical Information</h4>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-1/2">
                                            <input type="text" defaultValue={medicalRecord.id} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">ID</label>
                                        </div>
                                    </div>
                                    <div className='flex gap-4'>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={
                                                `${extractFeetAndInches(medicalRecord.patientMedNfoHeight).feet} ft ` + 
                                                `${extractFeetAndInches(medicalRecord.patientMedNfoHeight).inches} inches`
                                            } className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Height</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={medicalRecord.patientMedNfoWeight + " kg"} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">Weight</label>
                                        </div>
                                    </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoAllergies} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Allergies</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoMedications} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Medications</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoComorbidities} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Comorbidities</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoHistory} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Medical History</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoImmunization} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Immunization History</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <textarea defaultValue={medicalRecord.patientMedNfoFamilyHistory} className="textarea textarea-floating peer" readOnly />
                                            <label className="textarea-floating-label">Family Medical History</label>
                                        </div>
                                        <div className="form-control w-full">
                                            <input type="text" defaultValue={medicalRecord.patientMedNfoCOVIDVaxx} className="input input-floating peer" readOnly />
                                            <label className="input-floating-label">COVID-19 Vaccination</label>
                                        </div>
                                </div>
                            }
                        </div>
                        {/* LOGS SECTION */}
                        <div className='flex-1 flex flex-col gap-4'>
                            <div className="inventory-container !flex-none">
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
                            {!patientOutOfER &&
                                <AddLog admissionID={admissionID} updateLogsTbl={FetchPatientLogs} showLogModal={showLogModal} />   
                            }

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