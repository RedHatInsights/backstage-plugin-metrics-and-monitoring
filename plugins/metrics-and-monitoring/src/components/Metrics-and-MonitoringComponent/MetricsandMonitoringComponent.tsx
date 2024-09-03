import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { InfoCard, Page, Content, Link } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

const clusterMap = {
  crcs02ue1: {
    url: `https://prometheus.crcs02ue1.devshift.net`,
    name: 'stage',
    kibana: `https://kibana.apps.crcs02ue1.urby.p1.openshiftapps.com/app/kibana#/discover`,
    datasource: 'PDD8BE47D10408F45',
  },
  crcp01ue1: {
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
    entity.metadata.annotations?.[
      'metrics-and-monitoring/catchpoint-test-id'
    ];
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('');
  const [currentEnvironmentUrl, setCurrentEnvironmentUrl] =
    useState<string>('');
  const [currentEnvironmentKibana, setCurrentEnvironmentKibana] =
    useState<string>('');
  const [currentEnvironmentDatasource, setCurrentEnvironmentDatasource] =
    useState<string>('');

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
    const currentClusterName = getClusterName('crcs02ue1');
    const currentClusterUrl = getClusterUrl('crcs02ue1');
    const currentClusterDatasource = getClusterDatasource('crcs02ue1');
    const currentClusterKibana = getClusterKibana('crcs02ue1');
    setCurrentEnvironment(currentClusterName);
    setCurrentEnvironmentUrl(currentClusterUrl);
    setCurrentEnvironmentDatasource(currentClusterDatasource);
    setCurrentEnvironmentKibana(currentClusterKibana);
  }, []);

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
        <Grid container direction="row">
          <Grid item xs={11}>
            Metrics and Monitoring
          </Grid>
          <Grid item xs={1}>
            <ClusterSelect />
          </Grid>
        </Grid>
        <Grid container spacing={3} direction="row">
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
                <Link
                  target="_blank"
                  to={`${currentEnvironmentKibana}`}
                >
                  {' '}
                  Kibana logging{' '}
                </Link>
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={3}>
            <CatchpointItem />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
