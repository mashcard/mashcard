{{- define "brickdoc.deploymentCommon" }}
          image: {{ .Values.image.name | quote }}
          {{- if .Values.previewEnv }}
          imagePullPolicy: Always
          {{- end }}
          {{- if empty .Values.secrets  }}
          {{- else }}
          envFrom:
          - secretRef:
              name: {{ include "brickdoc.fullname" . }}
          {{- end }}    
          env:
            {{- range $key, $value := .Values.envs }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
            {{- if .Values.previewEnv }}
            - name: PREVIEW_ENV
              value: "true"
            # previewEnv is transient environment, so we use a fixed reversible int seed here.
            - name: SECURITY_REVERSIBLE_INT_PRIME
              value: "1828824083"
            - name: SECURITY_REVERSIBLE_INT_RANDOM
              value: "1480013428"
            - name: SECURITY_REVERSIBLE_INT_INVERSE
              value: "536856091"
            - name: REDIS_URL
              value: redis://{{ include "brickdoc.devDependenciesService" . }}:6379
            - name: BRICKDOC_DATABASE_URL
              value: postgresql://postgres:NonPersistenceInstance@{{ include "brickdoc.devDependenciesService" . }}/brickdoc_cicd
            - name: SMTP_FROM
              value: smtp-mock@{{ .Values.ingress.host }}
            - name: SMTP_URL
              value: smtp://{{ include "brickdoc.devDependenciesService" . }}:1025      
            {{- end }}
{{- end }}