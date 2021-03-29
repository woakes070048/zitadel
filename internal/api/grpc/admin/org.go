package admin

import (
	"context"
	"github.com/caos/zitadel/internal/api/grpc/object"

	org_grpc "github.com/caos/zitadel/internal/api/grpc/org"
	admin_pb "github.com/caos/zitadel/pkg/grpc/admin"
)

func (s *Server) IsOrgUnique(ctx context.Context, req *admin_pb.IsOrgUniqueRequest) (*admin_pb.IsOrgUniqueResponse, error) {
	isUnique, err := s.org.IsOrgUnique(ctx, req.Name, req.Domain)
	return &admin_pb.IsOrgUniqueResponse{IsUnique: isUnique}, err
}

func (s *Server) GetOrgByID(ctx context.Context, req *admin_pb.GetOrgByIDRequest) (*admin_pb.GetOrgByIDResponse, error) {
	org, err := s.org.OrgByID(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &admin_pb.GetOrgByIDResponse{Org: org_grpc.OrgViewToPb(org)}, nil
}

func (s *Server) ListOrgs(ctx context.Context, req *admin_pb.ListOrgsRequest) (*admin_pb.ListOrgsResponse, error) {
	query, err := listOrgRequestToModel(req)
	if err != nil {
		return nil, err
	}
	orgs, err := s.org.SearchOrgs(ctx, query)
	if err != nil {
		return nil, err
	}
	return &admin_pb.ListOrgsResponse{Result: org_grpc.OrgViewsToPb(orgs.Result)}, nil
}

func (s *Server) SetUpOrg(ctx context.Context, req *admin_pb.SetUpOrgRequest) (*admin_pb.SetUpOrgResponse, error) {
	human := setUpOrgHumanToDomain(req.User.(*admin_pb.SetUpOrgRequest_Human_).Human) //TODO: handle machine
	org := setUpOrgOrgToDomain(req.Org)

	objectDetails, err := s.command.SetUpOrg(ctx, org, human)
	if err != nil {
		return nil, err
	}
	return &admin_pb.SetUpOrgResponse{
		Details: object.DomainToAddDetailsPb(objectDetails),
	}, nil
}
