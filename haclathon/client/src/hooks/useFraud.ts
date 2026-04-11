import { useCallback, useEffect, useState } from 'react';
import { createDisputeApi, getDisputeStatusApi, getFraudLogsApi, getUserDisputesApi } from '../api/fraudApi';
import { DisputeCase, FraudReport } from '../types/fraud';

export const useFraud = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [dispute, setDispute] = useState<DisputeCase | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFraudLogsApi();
      setReports(data.reports);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserDisputesApi();
      setDisputes(data.disputes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
    void fetchDisputes();
  }, [fetchReports, fetchDisputes]);

  const submitDispute = async (transactionId: string, fraudReportId: string, message: string) => {
    setLoading(true);
    try {
      const data = await createDisputeApi({ transactionId, fraudReportId, message });
      setDispute(data.dispute);
      setDisputes((prev) => [data.dispute, ...prev.filter((item) => item._id !== data.dispute._id)]);
      await fetchDisputes();
      return data.dispute;
    } finally {
      setLoading(false);
    }
  };

  const fetchDispute = async (id: string) => {
    setLoading(true);
    try {
      const data = await getDisputeStatusApi(id);
      setDispute(data.dispute);
      return data.dispute;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    reports,
    disputes,
    dispute,
    fetchReports,
    fetchDisputes,
    submitDispute,
    fetchDispute
  };
};
