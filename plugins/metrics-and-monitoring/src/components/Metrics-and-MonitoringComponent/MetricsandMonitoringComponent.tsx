import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
} from '@material-ui/core';
import { InfoCard, Page, Content, Link } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

const clusterMap = {
  crcs02ue1: {
    proxy: '/prometheus/stage',
    url: `https://prometheus.crcs02ue1.devshift.net`,
    name: 'stage',
    kibana: `https://kibana.apps.crcs02ue1.urby.p1.openshiftapps.com/app/kibana#/discover`,
    datasource: 'PDD8BE47D10408F45',
  },
  crcp01ue1: {
    proxy: '/prometheus/prod',
    url: `https://prometheus.crcp01ue1.devshift.net`,
    name: 'prod',
    kibana: `https://kibana.apps.crcp01ue1.o9m8.p1.openshiftapps.com/app/kibana#/discover`,
    datasource: 'PC1EAC84DCBBF0697',
  },
};

export function MetricsandMonitoringComponent() {
  const { entity } = useEntity();
  const grafanaUrl =
    entity.metadata.annotations?.[
      'metrics-and-monitoring/grafana-dashboard-url'
    ];
  const catchpointUrl =
    entity.metadata.annotations?.['metrics-and-monitoring/catchpoint-test-id'];
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('');
  const [currentEnvironmentUrl, setCurrentEnvironmentUrl] =
    useState<string>('');
  const [currentEnvironmentKibana, setCurrentEnvironmentKibana] =
    useState<string>('');
  const [currentEnvironmentDatasource, setCurrentEnvironmentDatasource] =
    useState<string>('');
  const [currentEnvironmentProxy, setCurrentEnvironmentProxy] =
    useState<string>('');
  const [
    currentEnvironmentPrometheusData,
    setCurrentEnvironmentPrometheusData,
  ] = useState<object>({});

  const [error, setError] = useState<boolean>(false);

  const getClusterUrl = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].url;
    }
    return cluster;
  };

  const getClusterKibana = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].kibana;
    }
    return cluster;
  };

  const getClusterName = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].name;
    }
    return cluster;
  };

  const getClusterDatasource = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].datasource;
    }
    return cluster;
  };

  const getClusterProxy = (cluster: string) => {
    if (clusterMap[cluster as keyof typeof clusterMap]) {
      return clusterMap[cluster as keyof typeof clusterMap].proxy;
    }
    return cluster;
  };

  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const [page, setPage] = useState(0);
  const rowsPerPage = 25;

  const ClusterSelect = () => {
    return (
      <FormControl>
        <InputLabel id="cluster-select-label">Cluster</InputLabel>
        <Select
          labelId="cluster-select-label"
          id="cluster-select"
          value={currentEnvironment}
          onChange={e => {
            setCurrentEnvironmentDatasource(
              e.target.value === 'stage'
                ? getClusterDatasource('crcs02ue1')
                : getClusterDatasource('crcp01ue1'),
            );
            setCurrentEnvironment(e.target.value as string);
            setCurrentEnvironmentUrl(
              e.target.value === 'stage'
                ? getClusterUrl('crcs02ue1')
                : getClusterUrl('crcp01ue1'),
            );
            setCurrentEnvironmentProxy(
              e.target.value === 'stage'
                ? getClusterUrl('crcs02ue1')
                : getClusterUrl('crcp01ue1'),
            );
            setCurrentEnvironmentKibana(
              e.target.value === 'stage'
                ? getClusterKibana('crcs02ue1')
                : getClusterKibana('crcp01ue1'),
            );
          }}
        >
          <MenuItem value={'stage'}>Stage</MenuItem>
          <MenuItem value={'prod'}>Prod</MenuItem>
        </Select>
      </FormControl>
    );
  };

  useEffect(() => {
    const currentClusterProxy = getClusterProxy('/prometheus/stage');
    const currentClusterName = getClusterName('crcs02ue1');
    const currentClusterUrl = getClusterUrl('crcs02ue1');
    const currentClusterDatasource = getClusterDatasource('crcs02ue1');
    const currentClusterKibana = getClusterKibana('crcs02ue1');
    setCurrentEnvironment(currentClusterName);
    setCurrentEnvironmentUrl(currentClusterUrl);
    setCurrentEnvironmentDatasource(currentClusterDatasource);
    setCurrentEnvironmentKibana(currentClusterKibana);
    setCurrentEnvironmentProxy(currentClusterProxy);
  }, []);

  useEffect(() => {
    fetch(
      `${backendUrl}/api/proxy/${currentEnvironmentProxy}/query?query=graph?g0.expr=ALERTS{alertstate%3D"firing"%2C app_team%3D"${entity.metadata.title}"}&g0.tab=1&g0.display_mode=lines&g0.show_exemplars=0&g0.range_input=1h`,
    )
      .then(response => response.json())
      .then(response => {
        setCurrentEnvironmentPrometheusData(response.data?.result);
        console.log(response);
      })
      .catch(_error => {
        setError(true);
        console.error(`Error fetching data: ${_error}`);
      });
  }, []);

  const handleChangePage = (_: any, newPage: React.SetStateAction<number>) => {
    setPage(newPage);
  };

  if (error) {
    return <div>Error fetching alerts data</div>;
  }

  const AlertsTable = () => {
    return (
      <InfoCard title="Firing Alerts">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="Topics">
            <TableHead>
              <TableRow>
                <TableCell>Alert Name</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Instance</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentEnvironmentPrometheusData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((alert: { metric: { alertname: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; severity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; instance: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; value: number[]; }, index: React.Key | null | undefined) => (
                  <TableRow key={index}>
                    <TableCell>{alert.metric.alertname}</TableCell>
                    <TableCell>{alert.metric.severity}</TableCell>
                    <TableCell>{alert.metric.instance}</TableCell>
                    <TableCell>
                      {new Date(alert.value[0] * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>{JSON.stringify(alert.metric)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={currentEnvironmentPrometheusData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25]}
          />
        </TableContainer>
      </InfoCard>
    );
  };

  const GrafanaGridItem = () => {
    if (!grafanaUrl) {
      return;
    }
    return (
      <InfoCard title="Grafana">
        <Typography variant="body1">
          <Link
            target="_blank"
            to={`${grafanaUrl}&var-datasource=${currentEnvironmentDatasource}`}
          >
            {' '}
            Grafana dashboard
          </Link>
        </Typography>
      </InfoCard>
    );
  };

  const CatchpointItem = () => {
    if (!catchpointUrl) {
      return;
    }
    return (
      <InfoCard title="Catchpoint test">
        <Typography variant="body1">
          <Link
            target="_blank"
            to={`https://portal.catchpoint.com/ui/Symphony/ControlCenter/Tests/Test/${catchpointUrl}/Properties`}
          >
            {' '}
            Catchpoint test
          </Link>
        </Typography>
      </InfoCard>
    );
  };

  return (
    <Page themeId="tool">
      <Content>
        <Grid container spacing={5} direction="row">
          <Grid item xs={11}>
            Metrics and Monitoring
          </Grid>
          <Grid item xs={1}>
            <ClusterSelect />
          </Grid>
        </Grid>
        <Grid container spacing={2} direction="row">
          <Grid item xs={3}>
            <GrafanaGridItem />
          </Grid>
          <Grid item xs={3}>
            <InfoCard title="Prometheus">
              <Typography variant="body1">
                <Link
                  target="_blank"
                  to={`${currentEnvironmentUrl}/graph?g0.expr=ALERTS%7Balertstate%3D%22firing%22%2C%20app_team%3D%22${entity.metadata.title}%22%7D&g0.tab=1&g0.display_mode=lines&g0.show_exemplars=0&g0.range_input=1h`}
                >
                  {' '}
                  Prometheus Alerts{' '}
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={3}>
            <InfoCard title="Logging">
              <Typography variant="body1">
                <Link target="_blank" to={`${currentEnvironmentKibana}`}>
                  {' '}
                  Kibana logging{' '}
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={3}>
            <CatchpointItem />
          </Grid>
          <Grid item xs={12}>
            <AlertsTable />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
