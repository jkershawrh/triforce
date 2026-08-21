package health

import "os"

type Response struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

type Checker struct{}

func New() *Checker {
	return &Checker{}
}

func (c *Checker) Check() Response {
	version := os.Getenv("TRIFORCE_VERSION")
	if version == "" {
		version = "0.1.0"
	}
	return Response{
		Status:  "healthy",
		Service: "orchestrator",
		Version: version,
	}
}
